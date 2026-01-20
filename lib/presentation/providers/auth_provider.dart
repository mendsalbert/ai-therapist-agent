import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api/auth_service.dart';
import '../../data/models/user_model.dart';
import '../../services/storage/storage_service.dart';

final authServiceProvider = Provider<AuthService>((ref) => AuthService());

final currentUserProvider = StateNotifierProvider<CurrentUserNotifier, AsyncValue<UserModel?>>((ref) {
  return CurrentUserNotifier(ref.read(authServiceProvider));
});

class CurrentUserNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final AuthService _authService;

  CurrentUserNotifier(this._authService) : super(const AsyncValue.loading()) {
    loadUser();
  }

  Future<void> loadUser() async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        state = const AsyncValue.data(null);
        return;
      }

      final response = await _authService.getCurrentUser();
      if (response['success'] == true) {
        final userData = response['data'];
        state = AsyncValue.data(UserModel.fromJson(userData));
      } else {
        state = const AsyncValue.data(null);
      }
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      final response = await _authService.login(email, password);
      if (response['success'] == true) {
        final token = response['data']?['token'];
        if (token != null) {
          await StorageService.saveToken(token);
          await loadUser();
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    try {
      final response = await _authService.register(name, email, password);
      return response['success'] == true;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    await StorageService.deleteToken();
    await StorageService.clear();
    state = const AsyncValue.data(null);
  }
}

