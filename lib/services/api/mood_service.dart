import '../api/api_client.dart';

class MoodEntry {
  final String id;
  final int mood; // 1-10 scale
  final String? note;
  final DateTime createdAt;

  MoodEntry({
    required this.id,
    required this.mood,
    this.note,
    required this.createdAt,
  });

  factory MoodEntry.fromJson(Map<String, dynamic> json) {
    return MoodEntry(
      id: json['_id'] ?? json['id'] ?? '',
      mood: json['mood'] ?? 5,
      note: json['note'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class MoodService {
  final ApiClient _apiClient = ApiClient();

  Future<void> logMood({
    required int mood,
    String? note,
  }) async {
    try {
      final response = await _apiClient.post(
        '/mood',
        data: {
          'mood': mood,
          if (note != null) 'note': note,
        },
      );

      if (response.data['success'] != true) {
        throw Exception(response.data['error'] ?? 'Failed to log mood');
      }
    } catch (e) {
      throw Exception('Failed to log mood: $e');
    }
  }

  Future<List<MoodEntry>> getHistory({int limit = 30}) async {
    try {
      final response = await _apiClient.get(
        '/mood/history',
        queryParameters: {'limit': limit},
      );

      if (response.data['success'] == true) {
        final entries = response.data['entries'] ?? response.data['data'] ?? [];
        return (entries as List)
            .map((e) => MoodEntry.fromJson(e))
            .toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to load mood history: $e');
    }
  }

  Future<Map<String, dynamic>> getStats() async {
    try {
      final response = await _apiClient.get('/mood/stats');
      if (response.data['success'] == true) {
        return response.data['stats'] ?? response.data['data'] ?? {};
      }
      return {};
    } catch (e) {
      throw Exception('Failed to load mood stats: $e');
    }
  }
}

