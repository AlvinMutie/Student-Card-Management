import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shule_inadvantage/app/theme/app_theme.dart';
import 'package:shule_inadvantage/features/dashboard/presentation/models/visitor.dart';
import 'package:shule_inadvantage/features/qr_scan/presentation/models/scan_history_item.dart';
import 'package:shule_inadvantage/features/qr_scan/presentation/providers/scan_history_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:shule_inadvantage/core/services/haptic_service.dart';
import 'package:shule_inadvantage/core/presentation/widgets/liquid_background.dart';
import 'package:shule_inadvantage/core/presentation/widgets/staggered_slide.dart';
import 'package:shule_inadvantage/core/presentation/widgets/glass_card.dart';

class VisitorCheckInScreen extends StatefulWidget {
  const VisitorCheckInScreen({super.key});

  @override
  State<VisitorCheckInScreen> createState() => _VisitorCheckInScreenState();
}

class _VisitorCheckInScreenState extends State<VisitorCheckInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _idController = TextEditingController();
  final _phoneController = TextEditingController();
  final _purposeController = TextEditingController();
  final _visitedController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Visitor Check-In'),
      ),
      body: LiquidBackground(
        child: GestureDetector(
          onTap: () => FocusManager.instance.primaryFocus?.unfocus(),
          child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(AppTheme.defaultPadding),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                StaggeredSlide(
                  index: 0,
                  child: Text(
                    'Registering a new visitor',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: Theme.of(context).colorScheme.primary,
                        ),
                  ),
                ),
                const SizedBox(height: 8),
                StaggeredSlide(
                  index: 1,
                  child: const Text('Let\'s gather a few details to keep everyone safe and informed.'),
                ),
                const SizedBox(height: 32),
                
                StaggeredSlide(
                  index: 2,
                  child: TextFormField(
                    controller: _nameController,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Full Name',
                      hintText: 'What\'s the visitor\'s name?',
                      prefixIcon: Icon(Icons.person_outline, size: 20),
                    ),
                    validator: (value) => value == null || value.isEmpty ? 'Mind sharing their name?' : null,
                  ),
                ),
                const SizedBox(height: 16),
                
                StaggeredSlide(
                  index: 3,
                  child: TextFormField(
                    controller: _idController,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'ID / Passport Number',
                      hintText: 'For our identification records',
                      prefixIcon: Icon(Icons.badge_outlined, size: 20),
                    ),
                    validator: (value) => value == null || value.isEmpty ? 'We need this for security records' : null,
                  ),
                ),
                const SizedBox(height: 16),
                
                StaggeredSlide(
                  index: 4,
                  child: TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Phone Number',
                      hintText: 'So we can reach them if needed',
                      prefixIcon: Icon(Icons.phone_outlined, size: 20),
                    ),
                    validator: (value) => value == null || value.isEmpty ? 'A contact number is important' : null,
                  ),
                ),
                const SizedBox(height: 16),
                
                StaggeredSlide(
                  index: 5,
                  child: TextFormField(
                    controller: _visitedController,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Who are they visiting?',
                      hintText: 'e.g., Accounts or a specific Staff name',
                      prefixIcon: Icon(Icons.meeting_room_outlined, size: 20),
                    ),
                    validator: (value) => value == null || value.isEmpty ? 'Who should we notify?' : null,
                  ),
                ),
                const SizedBox(height: 16),
                
                StaggeredSlide(
                  index: 6,
                  child: TextFormField(
                    controller: _purposeController,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Reason for visit',
                      hintText: 'A brief note on why they\'re here',
                      prefixIcon: Icon(Icons.info_outline, size: 20),
                    ),
                    maxLines: 2,
                    validator: (value) => value == null || value.isEmpty ? 'Just a quick reason, please' : null,
                  ),
                ),
                const SizedBox(height: 32),
                
                StaggeredSlide(
                  index: 7,
                  child: Text(
                    'Vehicle Details (Optional)',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
                const SizedBox(height: 16),
                StaggeredSlide(
                  index: 8,
                  child: Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _vehicleModelController,
                          textInputAction: TextInputAction.next,
                          decoration: const InputDecoration(
                            labelText: 'Model',
                            hintText: 'e.g. Toyota Fielder',
                            prefixIcon: Icon(Icons.directions_car_outlined, size: 20),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _plateController,
                          textInputAction: TextInputAction.done,
                          onFieldSubmitted: (_) => _submit(),
                          decoration: const InputDecoration(
                            labelText: 'Plate',
                            hintText: 'KAA 001A',
                            prefixIcon: Icon(Icons.pin_outlined, size: 20),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 40),
                
                StaggeredSlide(
                  index: 9,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _submit,
                    child: _isLoading 
                      ? const SizedBox(
                          height: 24, 
                          width: 24, 
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)
                        )
                      : const Text('Complete Check-In'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}

  bool _isLoading = false;

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      HapticService.medium();
      setState(() => _isLoading = true);
      
      final visitorData = {
        'name': _nameController.text,
        'national_id': _idController.text,
        'nationalId': _idController.text,
        'phone_number': _phoneController.text,
        'phoneNumber': _phoneController.text,
        'purpose': _purposeController.text,
        'person_visited': _visitedController.text,
        'personVisited': _visitedController.text,
        'vehicle_model': _vehicleModelController.text,
        'plate_number': _plateController.text,
        'status': 'waiting',
      };

      final visitor = await context.read<VisitorProvider>().registerWalkIn(visitorData);
      
      if (mounted) {
        setState(() => _isLoading = false);
        if (visitor != null) {
          HapticService.success();
          _showSuccessDialog(visitor);
        } else {
          HapticService.error();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(context.read<VisitorProvider>().error ?? 'We had a bit of trouble with the registration. Mind trying again?'),
              backgroundColor: Theme.of(context).colorScheme.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } else {
      HapticService.error();
    }
  }

  void _showSuccessDialog(Visitor visitor) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.check_circle_outline, color: AppTheme.primaryColor, size: 64),
        title: const Text('All Caught Up!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('The visitor has been checked in and is ready to go.'),
            const SizedBox(height: 24),
            const Text('Visitor QR Code', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.qr_code_2_rounded, size: 120, color: Colors.black87),
            ),
            const SizedBox(height: 8),
            Text('ID: ${visitor.id}', style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              HapticService.light();
              Navigator.pop(context);
              context.pop();
            },
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  final _vehicleModelController = TextEditingController();
  final _plateController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _idController.dispose();
    _phoneController.dispose();
    _purposeController.dispose();
    _visitedController.dispose();
    _vehicleModelController.dispose();
    _plateController.dispose();
    super.dispose();
  }
}
