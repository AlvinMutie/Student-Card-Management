const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/payments/categories
 * @desc    Retrieve all fee categories (priority and caps)
 * @access  Private
 */
router.get('/categories', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, priority, cap_amount, description FROM fee_categories ORDER BY priority ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route   GET /api/payments/allocations/:parentId
 * @desc    Retrieve all payment allocations for a specific parent
 * @access  Private
 */
router.get('/allocations/:parentId', authenticateToken, async (req, res) => {
    try {
        const { parentId } = req.params;
        const result = await pool.query(
            `SELECT fa.id, fa.amount_allocated, fa.created_at, fc.name as category_name, p.transaction_ref
       FROM fee_allocations fa
       JOIN payments p ON fa.payment_id = p.id
       JOIN fee_categories fc ON fa.category_id = fc.id
       WHERE p.parent_id = $1
       ORDER BY fa.created_at DESC`,
            [parentId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get allocations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route   POST /api/payments/submit
 * @desc    Submit a payment and automatically allocate across prioritized categories
 * @access  Private (Admin or Parent)
 */
router.post('/submit', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { parent_id, amount, transaction_ref, payment_method } = req.body;

        if (!parent_id || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid parent ID and amount are required' });
        }

        await client.query('BEGIN');

        // 1. Create the master payment record
        const paymentRes = await client.query(
            'INSERT INTO payments (parent_id, amount, transaction_ref, payment_method) VALUES ($1, $2, $3, $4) RETURNING id',
            [parent_id, amount, transaction_ref || `REF-${Date.now()}`, payment_method || 'mobile_app']
        );
        const paymentId = paymentRes.rows[0].id;

        // 2. Fetch all categories sorted by priority
        const categoriesRes = await client.query('SELECT * FROM fee_categories ORDER BY priority ASC');
        const categories = categoriesRes.rows;

        // 3. Logic for prioritized allocation
        let remainingToAllocate = parseFloat(amount);
        const allocations = [];

        for (const category of categories) {
            if (remainingToAllocate <= 0) break;

            // Get how much this parent has already paid for THIS category across ALL their students/payments
            const paidRes = await client.query(
                `SELECT SUM(fa.amount_allocated) as total_paid 
         FROM fee_allocations fa 
         JOIN payments p ON fa.payment_id = p.id 
         WHERE p.parent_id = $1 AND fa.category_id = $2`,
                [parent_id, category.id]
            );

            const alreadyPaid = parseFloat(paidRes.rows[0].total_paid || 0);
            const cap = parseFloat(category.cap_amount);
            const roomLeft = Math.max(0, cap - alreadyPaid);

            if (roomLeft > 0) {
                const allocateAmount = Math.min(remainingToAllocate, roomLeft);

                // Save the allocation
                await client.query(
                    'INSERT INTO fee_allocations (payment_id, category_id, amount_allocated) VALUES ($1, $2, $3)',
                    [paymentId, category.id, allocateAmount]
                );

                allocations.push({
                    category_id: category.id,
                    category_name: category.name,
                    amount: allocateAmount
                });

                remainingToAllocate -= allocateAmount;
            }
        }

        // Optional: If there is still money left after all caps are met, put it in the highest priority category (Overpayment)
        // Or just save it as a "pre-payment/credit" record. 
        // For this module, we will stop at caps as requested.

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Payment processed and allocated successfully',
            payment_id: paymentId,
            total_amount: amount,
            allocations: allocations,
            unallocated_remainder: remainingToAllocate
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Payment submission error:', error);
        res.status(500).json({ error: 'Failed to process payment', details: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
