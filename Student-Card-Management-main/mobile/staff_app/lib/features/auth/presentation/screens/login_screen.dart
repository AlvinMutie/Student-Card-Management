import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shule_inadvantage/app/routes/app_router.dart';
import 'package:shule_inadvantage/app/theme/app_theme.dart';
import 'package:provider/provider.dart';
import 'package:shule_inadvantage/features/auth/presentation/providers/auth_provider.dart';
import 'package:dotlottie_flutter/dotlottie_flutter.dart';
import 'package:shule_inadvantage/core/services/haptic_service.dart';
import 'package:shule_inadvantage/core/presentation/widgets/liquid_background.dart';
import 'package:shule_inadvantage/core/presentation/widgets/glass_card.dart';
import 'package:shule_inadvantage/core/presentation/widgets/staggered_slide.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _obscurePassword = true;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      HapticService.error();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Mind sharing both your Staff ID and PIN?'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    HapticService.medium();
    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.login(email, password);

    if (success) {
      HapticService.success();
      if (mounted) {
        context.go(AppRouter.dashboard);
      }
    } else {
      HapticService.error();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error ?? 'We couldn\'t sign you in. Mind checking your details?'),
            backgroundColor: Theme.of(context).colorScheme.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      body: LiquidBackground(
        child: SafeArea(
          child: GestureDetector(
          onTap: () => FocusScope.of(context).unfocus(),
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppTheme.defaultPadding),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  StaggeredSlide(
                    index: 0,
                    child: Column(
                      children: [
                  const SizedBox(height: 20),
                  SizedBox(
                    height: 220,
                    width: 220,
                    child: DotLottieView(
                      source: 'https://lottie.host/ebe6067a-e7fb-460e-9b30-51ab29145f5a/PC0dCr525y.lottie',
                      sourceType: 'url',
                      autoplay: true,
                      loop: true,
                      speed: 3.0,
                    ),
                  ),
                        const SizedBox(height: 32),
                        Text(
                          'Welcome back',
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            letterSpacing: -1.5,
                            fontWeight: FontWeight.w900,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Ready to start your shift? Sign in to the Staff Portal',
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 48),

                  StaggeredSlide(
                    index: 1,
                    child: GlassCard(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            decoration: const InputDecoration(
                              labelText: 'Staff ID or Email',
                              prefixIcon: Icon(Icons.badge_outlined, size: 20),
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            textInputAction: TextInputAction.done,
                            onFieldSubmitted: (_) => _handleLogin(),
                            decoration: InputDecoration(
                              labelText: 'PIN',
                              prefixIcon: const Icon(Icons.lock_outline, size: 20),
                              suffixIcon: IconButton(
                                onPressed: () {
                                  HapticService.light();
                                  setState(() => _obscurePassword = !_obscurePassword);
                                },
                                icon: Icon(
                                  _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                  size: 20,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 32),
                          ElevatedButton(
                            onPressed: authProvider.status == AuthStatus.authenticating 
                                ? null 
                                : _handleLogin,
                            child: authProvider.status == AuthStatus.authenticating
                                ? const SizedBox(
                                    height: 24,
                                    width: 24,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text('Sign In'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

}
