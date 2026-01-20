import '../api/api_client.dart';

class Meditation {
  final String id;
  final String title;
  final String description;
  final int duration;
  final String audioUrl;
  final String category;
  final bool isPremium;
  final List<String> tags;
  final String? thumbnailUrl;

  Meditation({
    required this.id,
    required this.title,
    required this.description,
    required this.duration,
    required this.audioUrl,
    required this.category,
    required this.isPremium,
    required this.tags,
    this.thumbnailUrl,
  });

  factory Meditation.fromJson(Map<String, dynamic> json) {
    return Meditation(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      duration: json['duration'] ?? 0,
      audioUrl: json['audioUrl'] ?? '',
      category: json['category'] ?? '',
      isPremium: json['isPremium'] ?? false,
      tags: List<String>.from(json['tags'] ?? []),
      thumbnailUrl: json['thumbnailUrl'],
    );
  }
}

class MeditationService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Meditation>> getMeditations({
    String? search,
    String? category,
    bool? isPremium,
    int limit = 50,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'limit': limit,
        if (search != null) 'search': search,
        if (category != null) 'category': category,
        if (isPremium != null) 'isPremium': isPremium,
      };

      final response = await _apiClient.get(
        '/meditations',
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final meditations = response.data['meditations'] ?? response.data['data'] ?? [];
        return (meditations as List)
            .map((m) => Meditation.fromJson(m))
            .toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to load meditations: $e');
    }
  }

  Future<Meditation> getMeditation(String id) async {
    try {
      final response = await _apiClient.get('/meditations/$id');
      if (response.data['success'] == true) {
        return Meditation.fromJson(response.data['meditation'] ?? response.data['data']);
      }
      throw Exception(response.data['error'] ?? 'Failed to load meditation');
    } catch (e) {
      throw Exception('Failed to load meditation: $e');
    }
  }

  Future<void> toggleFavorite(String meditationId) async {
    try {
      final response = await _apiClient.post('/meditations/$meditationId/favorite');
      if (response.data['success'] != true) {
        throw Exception(response.data['error'] ?? 'Failed to toggle favorite');
      }
    } catch (e) {
      throw Exception('Failed to toggle favorite: $e');
    }
  }

  Future<List<Meditation>> getFavorites() async {
    try {
      final response = await _apiClient.get('/meditations/favorites');
      if (response.data['success'] == true) {
        final meditations = response.data['meditations'] ?? response.data['data'] ?? [];
        return (meditations as List)
            .map((m) => Meditation.fromJson(m))
            .toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to load favorites: $e');
    }
  }
}

