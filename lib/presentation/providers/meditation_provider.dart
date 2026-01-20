import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api/meditation_service.dart';
import 'meditation_local_storage.dart';

final meditationServiceProvider = Provider<MeditationService>((ref) => MeditationService());
final meditationLocalStorageProvider = Provider<MeditationLocalStorage>((ref) => MeditationLocalStorage());

final meditationsProvider = StateNotifierProvider<MeditationsNotifier, AsyncValue<List<Meditation>>>((ref) {
  return MeditationsNotifier(
    ref.read(meditationServiceProvider),
    ref.read(meditationLocalStorageProvider),
  );
});

class MeditationsNotifier extends StateNotifier<AsyncValue<List<Meditation>>> {
  final MeditationService _meditationService;
  final MeditationLocalStorage _localStorage;

  MeditationsNotifier(this._meditationService, this._localStorage)
      : super(const AsyncValue.loading()) {
    loadMeditations();
  }

  Future<void> loadMeditations({bool useCache = true}) async {
    try {
      if (useCache) {
        final cached = await _localStorage.getMeditations();
        if (cached.isNotEmpty) {
          state = AsyncValue.data(cached);
        }
      }

      final meditations = await _meditationService.getMeditations();
      state = AsyncValue.data(meditations);
      
      await _localStorage.saveMeditations(meditations);
    } catch (e) {
      if (useCache) {
        final cached = await _localStorage.getMeditations();
        if (cached.isNotEmpty) {
          state = AsyncValue.data(cached);
          return;
        }
      }
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> toggleFavorite(String meditationId) async {
    try {
      await _meditationService.toggleFavorite(meditationId);
      await loadMeditations(useCache: false);
    } catch (e) {
      // Handle error
    }
  }
}

