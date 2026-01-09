import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';

class ReceiptCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final Map<String, String> items;
  final String totalLabel;
  final String totalValue;
  final Color statusColor;

  const ReceiptCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.items,
    required this.totalLabel,
    required this.totalValue,
    this.statusColor = Colors.black,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Card Content
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Logo placeholder or actual logo
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Image.asset(
                          'assets/images/logo.png',
                          height: 30,
                          errorBuilder: (c, e, s) => const Icon(Icons.school, color: Colors.green),
                        ),
                      ),
                    ),
                    const Spacer(),
                    Text(
                      DateFormat('dd.MM.yyyy').format(DateTime.now()),
                      style: TextStyle(
                        color: Colors.grey[400],
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),

              // Divider
              Divider(height: 1, color: Colors.grey[200]),

              // Body (Items)
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  children: [
                    // Column Headers
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: Row(
                        children: [
                          Text(
                            'DESCRIPTION',
                            style: TextStyle(
                              color: Colors.grey[300],
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            'VALUE',
                            style: TextStyle(
                              color: Colors.grey[300],
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    // List Items
                    ...items.entries.map((entry) => Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            flex: 2,
                            child: Text(
                              entry.key,
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          Expanded(
                            child: Text(
                              entry.value,
                              textAlign: TextAlign.end,
                              style: const TextStyle(
                                color: Colors.black87,
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )),

                    const SizedBox(height: 12),
                    
                    // Total / Status Row
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          totalLabel,
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          totalValue,
                          style: TextStyle(
                            color: statusColor,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Footer Branding
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
                child: Container(
                  height: 50,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: const Center(
                    child: Row(
                       mainAxisSize: MainAxisSize.min,
                       children: [
                         Icon(Icons.verified_user_outlined, size: 16, color: Colors.black54),
                         SizedBox(width: 8),
                         Text(
                          'SHULENI ADVANTAGE',
                          style: TextStyle(
                            color: Colors.black87,
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 3.0,
                            fontFamily: 'Roboto', 
                          ),
                        ),
                       ],
                     ),
                  ),
                ),
              ),
            ],
          ),

          // Lottie Animation (Overlay at the top - Last in Stack is Top)
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
              child: LottieBuilder.network(
                'https://lottie.host/3ad958dd-1ecc-4156-8247-9f58e1f1773b/bSRomK0KxR.json',
                height: 150,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
