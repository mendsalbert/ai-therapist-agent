import '../api/api_client.dart';
import '../../data/models/journal_entry_model.dart';

class JournalService {
  final ApiClient _apiClient = ApiClient();

  Future<List<JournalEntryModel>> getEntries({int limit = 100}) async {
    try {
      final response = await _apiClient.get(
        '/journal',
        queryParameters: {'limit': limit},
      );
      
      if (response.data['success'] == true) {
        final entries = response.data['entries'] ?? response.data['data'] ?? [];
        return (entries as List)
            .map((e) => JournalEntryModel.fromJson(e))
            .toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to load journal entries: $e');
    }
  }

  Future<JournalEntryModel> createEntry({
    required String title,
    required String content,
    required int mood,
    List<String>? tags,
  }) async {
    try {
      final response = await _apiClient.post(
        '/journal',
        data: {
          'title': title,
          'content': content,
          'mood': mood,
          'tags': tags ?? [],
        },
      );
      
      if (response.data['success'] == true) {
        return JournalEntryModel.fromJson(response.data['entry'] ?? response.data['data']);
      }
      throw Exception(response.data['error'] ?? 'Failed to create entry');
    } catch (e) {
      throw Exception('Failed to create journal entry: $e');
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
      final response = await _apiClient.put(
        '/journal/$id',
        data: {
          if (title != null) 'title': title,
          if (content != null) 'content': content,
          if (mood != null) 'mood': mood,
          if (tags != null) 'tags': tags,
        },
      );
      
      if (response.data['success'] == true) {
        return JournalEntryModel.fromJson(response.data['entry'] ?? response.data['data']);
      }
      throw Exception(response.data['error'] ?? 'Failed to update entry');
    } catch (e) {
      throw Exception('Failed to update journal entry: $e');
    }
  }

  Future<void> deleteEntry(String id) async {
    try {
      final response = await _apiClient.delete('/journal/$id');
      if (response.data['success'] != true) {
        throw Exception(response.data['error'] ?? 'Failed to delete entry');
      }
    } catch (e) {
      throw Exception('Failed to delete journal entry: $e');
    }
  }
}

