import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shule_inadvantage/app/routes/app_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:shule_inadvantage/core/presentation/widgets/receipt_card.dart';
import 'package:shule_inadvantage/features/dashboard/presentation/models/visitor.dart';
import 'package:shule_inadvantage/features/student/presentation/models/student.dart';
import 'package:shule_inadvantage/features/qr_scan/presentation/models/scan_history_item.dart';
import 'package:shule_inadvantage/features/qr_scan/presentation/providers/scan_history_provider.dart';
import 'package:shule_inadvantage/features/student/data/repositories/student_repository.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shule_inadvantage/features/auth/presentation/providers/auth_provider.dart';

class ScanQrScreen extends StatefulWidget {
  const ScanQrScreen({super.key});

  @override
  State<ScanQrScreen> createState() => _ScanQrScreenState();
}

class _ScanQrScreenState extends State<ScanQrScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = false;
  bool _hasScanned = false;
  bool _permissionGranted = false;
  String _debugStatus = 'Checking camera permission...';
  late AnimationController _animationController;
  MobileScannerController? _controller;
  final StudentRepository _studentRepository = StudentRepository();

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _initializeScanner();
  }

  Future<void> _initializeScanner() async {
    setState(() {
      _debugStatus = 'Requesting camera permission...';
    });

    final status = await Permission.camera.request();
    
    if (!mounted) return;

    if (status.isGranted) {
      setState(() {
        _debugStatus = 'Permission granted. Initializing scanner...';
        _permissionGranted = true;
      });

      // Initialize controller with unrestricted detection for complex QR codes
      _controller = MobileScannerController(
        detectionSpeed: DetectionSpeed.unrestricted,  // More thorough scanning
        facing: CameraFacing.back,
        returnImage: false,
      );

      // Start the scanner
      await _controller!.start();

      if (mounted) {
        setState(() {
          _debugStatus = 'Scanner ready. Tap to focus on code...';
        });
      }
    } else if (status.isPermanentlyDenied) {
      setState(() {
        _debugStatus = 'Camera permission denied';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Camera permission required. Please enable in settings.'),
          action: SnackBarAction(
            label: 'Settings',
            onPressed: () => openAppSettings(),
          ),
        ),
      );
    } else {
      setState(() {
        _debugStatus = 'Camera permission not granted';
      });
    }
  }

  void _onQRCodeScanned(String qrData) async {
    if (_isLoading || _hasScanned) return;
    
    setState(() {
      _hasScanned = true;
      _isLoading = true;
      _debugStatus = 'Processing: $qrData';
    });

    // Log the scanned data for debugging
    debugPrint('🔍 QR Code Scanned: "$qrData"');
    debugPrint('📏 Length: ${qrData.length}');
    debugPrint('🏷️ Starts with VISIT-: ${qrData.startsWith('VISIT-')}');

    // Success feedback
    await Future.delayed(const Duration(milliseconds: 500));

    if (!mounted) return;

    try {
      // 1. Try to verify as a visitor first if it has a visitor prefix or just try it
      if (qrData.startsWith('VISIT-') || qrData.length > 10) {
        debugPrint('🚶 Attempting visitor verification...');
        
        final visitor = await context.read<VisitorProvider>().verifyVisitor(qrData);
        
        if (visitor != null && mounted) {
           debugPrint('✅ Visitor verified: ${visitor.name}');
           context.read<ScanHistoryProvider>().addScan(ScanHistoryItem.fromVisitor(visitor));
           _showVisitorResult(visitor);
           return;
        } else {
          debugPrint('❌ Visitor verification returned null');
        }
      }

      // 2. If visitor verification failed or not applicable, it might be a student
      debugPrint('🎓 Attempting student lookup...');
      if (!mounted) return;
      
      try {
        final userId = context.read<AuthProvider>().user?['id']?.toString();
        final student = await _studentRepository.lookupStudent(qrData, scannedBy: userId);
        if (mounted) {
          debugPrint('✅ Student found: ${student.name}');
          context.read<ScanHistoryProvider>().addScan(ScanHistoryItem.fromStudent(student));
          _showStudentResult(student);
          return;
        }
      } catch (studentError) {
        debugPrint('❌ Student lookup failed: $studentError');
        // If both failed, then we show the error
        throw studentError;
      }
    } catch (e) {
      debugPrint('❌ ERROR: $e');
      
      if (mounted) {
        // Show detailed error on screen
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Scan Failed'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Could not verify code:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Code: "$qrData"', style: const TextStyle(fontFamily: 'monospace')),
                const SizedBox(height: 8),
                Text('Error: $e', style: const TextStyle(color: Colors.red)),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  setState(() {
                    _isLoading = false;
                    _hasScanned = false;
                    _debugStatus = 'Scanner ready';
                  });
                },
                child: const Text('Try Again'),
              ),
            ],
          ),
        );
      }
    }
  }

  void _showVisitorResult(Visitor visitor) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ReceiptCard(
              title: 'Visitor Pass',
              subtitle: DateFormat('dd.MM.yyyy').format(DateTime.now()),
              items: {
                'Visitor Name': visitor.name,
                'Purpose': visitor.purpose,
                'ID Number': visitor.nationalId,
                'Phone': visitor.phoneNumber,
              },
              totalLabel: 'Status',
              totalValue: visitor.status.name.toUpperCase(),
              statusColor: visitor.isValid ? Colors.green : Colors.red,
            ),
            const SizedBox(height: 16),
             SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  context.go(AppRouter.visitorList);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                   shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('CLOSE & VIEW LIST', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    ).then((_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _hasScanned = false;
        });
      }
    });
  }

  void _showStudentResult(Student student) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ReceiptCard(
              title: 'Student Profile',
              subtitle: DateFormat('dd.MM.yyyy').format(DateTime.now()),
              items: {
                'Name': student.name,
                'Admission No.': student.admissionNumber,
                'Class': student.studentClass ?? 'N/A',
                'House': student.house ?? 'N/A',
                'Meal Validity': student.mealCardValidity?.toString() ?? 'N/A',
                'Fee Balance': 'KES ${student.feeBalance.toStringAsFixed(2)}',
              },
              totalLabel: 'Status',
              totalValue: student.status?.toUpperCase() ?? 'ACTIVE',
              statusColor: Colors.green,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text('CLOSE', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      // Navigate to dashboard or record check-in
                      context.go(AppRouter.dashboard);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text('CHECK IN', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ).then((_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _hasScanned = false;
          _debugStatus = 'Scanner ready';
        });
      }
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset('assets/images/logo.png', height: 28, color: Colors.white),
            const SizedBox(width: 10),
            const Text('Scan QR Code'),
          ],
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.white,
      ),
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Only show scanner when permission is granted and controller is initialized
          if (_permissionGranted && _controller != null)
            MobileScanner(
              controller: _controller!,
              errorBuilder: (context, error, child) {
                return Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error, color: Colors.red, size: 50),
                      const SizedBox(height: 16),
                      Text(
                        'Camera Error: ${error.errorCode}\n${error.errorDetails?.message}',
                        style: const TextStyle(color: Colors.white),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                );
              },
              onDetect: (capture) {
                final barcodes = capture.barcodes;
                if (barcodes.isNotEmpty) {
                   if (mounted) {
                     setState(() {
                        _debugStatus = 'Detected: ${barcodes.first.rawValue}';
                     });
                   }
                }
                for (final barcode in barcodes) {
                  debugPrint('Barcode detected: ${barcode.rawValue}');
                  if (barcode.rawValue != null) {
                    _onQRCodeScanned(barcode.rawValue!);
                    break; 
                  }
                }
              },
            ),
          
          // Darkened background with cutout
          ColorFiltered(
            colorFilter: ColorFilter.mode(
              Colors.black.withValues(alpha: 0.5),
              BlendMode.srcOut,
            ),
            child: Stack(
              children: [
                Container(
                  decoration: const BoxDecoration(
                    color: Colors.black,
                    backgroundBlendMode: BlendMode.dstOut,
                  ),
                ),
                Center(
                  child: Container(
                    width: 300,  // Larger area for dense codes
                    height: 300,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Glowing Frame with tap-to-focus
          Center(
            child: GestureDetector(
              onTap: () {
                // Reset autofocus when user taps
                _controller?.resetZoomScale();
                if (mounted) {
                  setState(() => _debugStatus = 'Focusing...');
                  Future.delayed(const Duration(milliseconds: 500), () {
                    if (mounted) setState(() => _debugStatus = 'Scanner ready. Tap to refocus...');
                  });
                }
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: 300,  // Match larger scan area
                height: 300,
                decoration: BoxDecoration(
                  border: Border.all(
                    color: _hasScanned ? Colors.green : Colors.white70, 
                    width: 3,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                     BoxShadow(
                      color: _hasScanned ? Colors.green.withValues(alpha: 0.5) : Colors.white10,
                      blurRadius: 10,
                      spreadRadius: 2,
                    )
                  ],
                ),
              ),
            ),
          ),

          // Moving Scanning Line
          if (!_hasScanned)
            Center(
              child: AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  return Transform.translate(
                    offset: Offset(0, -110 + (220 * _animationController.value)),
                    child: Container(
                      width: 230,
                      height: 2,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.green.withValues(alpha: 0),
                            Colors.green,
                            Colors.green.withValues(alpha: 0),
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.green.withValues(alpha: 0.5),
                            blurRadius: 5,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

          // UI Elements
          Positioned(
            bottom: 80,
            left: 0,
            right: 0,
            child: Column(
              children: [
                Text(
                  _hasScanned ? 'SCANNED SUCCESSFULLY' : 'ALIGN QR CODE',
                  style: TextStyle(
                    color: _hasScanned ? Colors.green : Colors.white,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _debugStatus, // Show debug status
                  style: const TextStyle(color: Colors.yellow, fontSize: 12),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Tap the frame to refocus camera',
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),

          if (_isLoading)
            const Center(child: CircularProgressIndicator(color: Colors.green)),

          // Controls
          if (_controller != null)
            Positioned(
              top: MediaQuery.of(context).padding.top + 60,
              right: 20,
              child: Column(
                children: [
                  _buildControlButton(
                    icon: Icons.flash_on,
                    onPressed: () => _controller!.toggleTorch(),
                  ),
                  const SizedBox(height: 16),
                  _buildControlButton(
                    icon: Icons.flip_camera_ios,
                    onPressed: () => _controller!.switchCamera(),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildControlButton({required IconData icon, required VoidCallback onPressed}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(12),
      ),
      child: IconButton(
        icon: Icon(icon, color: Colors.white),
        onPressed: onPressed,
      ),
    );
  }
}
