import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api/journal_service.dart';
import '../../data/models/journal_entry_model.dart';
import '../local/journal_local_storage.dart';

final journalServiceProvider = Provider<JournalService>((ref) => JournalService());
final journalLocalStorageProvider = Provider<JournalLocalStorage>((ref) => JournalLocalStorage());

final journalEntriesProvider = StateNotifierProvider<JournalEntriesNotifier, AsyncValue<List<JournalEntryModel>>>((ref) {
  return JournalEntriesNotifier(
    ref.read(journalServiceProvider),
    ref.read(journalLocalStorageProvider),
  );
});

class JournalEntriesNotifier extends StateNotifier<AsyncValue<List<JournalEntryModel>>> {
  final JournalService _journalService;
  final JournalLocalStorage _localStorage;

  JournalEntriesNotifier(this._journalService, this._localStorage)
      : super(const AsyncValue.loading()) {
    loadEntries();
  }

  Future<void> loadEntries({bool useCache = true}) async {
    try {
      // Try to load from cache first
      if (useCache) {
        final cached = await _localStorage.getEntries();
        if (cached.isNotEmpty) {
          state = AsyncValue.data(cached);
        }
      }

      // Load from API
      final entries = await _journalService.getEntries();
      state = AsyncValue.data(entries);
      
      // Cache the entries
      await _localStorage.saveEntries(entries);
    } catch (e) {
      // If API fails, try cache
      if (useCache) {
        final cached = await _localStorage.getEntries();
        if (cached.isNotEmpty) {
          state = AsyncValue.data(cached);
          return;
        }
      }
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<JournalEntryModel> createEntry({
    required String title,
    required String content,
    required int mood,
    List<String>? tags,
  }) async {
    try {
      final entry = await _journalService.createEntry(
        title: title,
        content: content,
        mood: mood,
        tags: tags,
      );

      // Update local state
      final current = state.value ?? [];
      state = AsyncValue.data([entry, ...current]);
      
      // Update cache
      await _localStorage.saveEntry(entry);

      return entry;
    } catch (e) {
      throw Exception('Failed to create entry: $e');
    }
  }

  Future<JournalEntryModel> updateEntry({
    required String id,
    String? title,
    String? content,
    int? mood,
    List<String>? tags,
  }) async {
    try {
      final entry = await _journalService.updateEntry(
        id: id,
        title: title,
        content: content,
        mood: mood,
        tags: tags,
      );

      // Update local state
      final current = state.value ?? [];
      final updated = current.map((e) => e.id == id ? entry : e).toList();
      state = AsyncValue.data(updated);
      
      // Update cache
      await _localStorage.saveEntry(entry);

      return entry;
    } catch (e) {
      throw Exception('Failed to update entry: $e');
    }
  }

  Future<void> deleteEntry(String id) async {
    try {
      await _journalService.deleteEntry(id);

      // Update local state
      final current = state.value ?? [];
      final filtered = current.where((e) => e.id != id).toList();
      state = AsyncValue.data(filtered);
      
      // Update cache
      await _localStorage.deleteEntry(id);
    } catch (e) {
      throw Exception('Failed to delete entry: $e');
    }
  }
}

