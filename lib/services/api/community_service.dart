import '../api/api_client.dart';

class CommunityPost {
  final String id;
  final String userId;
  final String? username;
  final String spaceId;
  final String content;
  final String? mood;
  final bool isAnonymous;
  final List<String>? images;
  final Map<String, List<String>> reactions;
  final int commentCount;
  final String? aiReflection;
  final DateTime createdAt;

  CommunityPost({
    required this.id,
    required this.userId,
    this.username,
    required this.spaceId,
    required this.content,
    this.mood,
    required this.isAnonymous,
    this.images,
    required this.reactions,
    required this.commentCount,
    this.aiReflection,
    required this.createdAt,
  });

  factory CommunityPost.fromJson(Map<String, dynamic> json) {
    return CommunityPost(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId']?['_id'] ?? json['userId'] ?? '',
      username: json['userId']?['username'],
      spaceId: json['spaceId'] ?? '',
      content: json['content'] ?? '',
      mood: json['mood'],
      isAnonymous: json['isAnonymous'] ?? false,
      images: json['images'] != null ? List<String>.from(json['images']) : null,
      reactions: Map<String, List<String>>.from(json['reactions'] ?? {}),
      commentCount: json['commentCount'] ?? json['comments']?.length ?? 0,
      aiReflection: json['aiReflection'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class CommunityComment {
  final String id;
  final String userId;
  final String? username;
  final String content;
  final bool isAnonymous;
  final List<String>? images;
  final DateTime createdAt;
  final List<CommunityComment>? replies;

  CommunityComment({
    required this.id,
    required this.userId,
    this.username,
    required this.content,
    required this.isAnonymous,
    this.images,
    required this.createdAt,
    this.replies,
  });

  factory CommunityComment.fromJson(Map<String, dynamic> json) {
    return CommunityComment(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId']?['_id'] ?? json['userId'] ?? '',
      username: json['userId']?['username'],
      content: json['content'] ?? '',
      isAnonymous: json['isAnonymous'] ?? false,
      images: json['images'] != null ? List<String>.from(json['images']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      replies: json['replies'] != null
          ? (json['replies'] as List).map((r) => CommunityComment.fromJson(r)).toList()
          : null,
    );
  }
}

class CommunityService {
  final ApiClient _apiClient = ApiClient();

  Future<List<CommunityPost>> getFeed({int limit = 30}) async {
    try {
      final response = await _apiClient.get(
        '/community/feed',
        queryParameters: {'limit': limit},
      );

      if (response.data['success'] == true) {
        final posts = response.data['posts'] ?? response.data['data'] ?? [];
        return (posts as List)
            .map((p) => CommunityPost.fromJson(p))
            .toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to load community feed: $e');
    }
  }

  Future<CommunityPost> createPost({
    required String spaceId,
    required String content,
    String? mood,
    bool isAnonymous = false,
    List<String>? images,
  }) async {
    try {
      final response = await _apiClient.post(
        '/community/posts',
        data: {
          'spaceId': spaceId,
          'content': content,
          if (mood != null) 'mood': mood,
          'isAnonymous': isAnonymous,
          if (images != null) 'images': images,
        },
      );

      if (response.data['success'] == true) {
        return CommunityPost.fromJson(response.data['post'] ?? response.data['data']);
      }
      throw Exception(response.data['error'] ?? 'Failed to create post');
    } catch (e) {
      throw Exception('Failed to create post: $e');
    }
  }

  Future<void> reactToPost(String postId, String reactionType) async {
    try {
      final response = await _apiClient.post(
        '/community/posts/$postId/react',
        data: {'reactionType': reactionType},
      );

      if (response.data['success'] != true) {
        throw Exception(response.data['error'] ?? 'Failed to react');
      }
    } catch (e) {
      throw Exception('Failed to react to post: $e');
    }
  }

  Future<List<CommunityComment>> getComments(String postId) async {
    try {
      final response = await _apiClient.get('/community/posts/$postId/comments');

      if (response.data['success'] == true) {
        final comments = response.data['comments'] ?? response.data['data'] ?? [];
        return (comments as List)
            .map((c) => CommunityComment.fromJson(c))
            .toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to load comments: $e');
    }
  }

  Future<CommunityComment> addComment({
    required String postId,
    required String content,
    bool isAnonymous = false,
    String? parentCommentId,
    List<String>? images,
  }) async {
    try {
      final response = await _apiClient.post(
        '/community/comments',
        data: {
          'postId': postId,
          'content': content,
          'isAnonymous': isAnonymous,
          if (parentCommentId != null) 'parentCommentId': parentCommentId,
          if (images != null) 'images': images,
        },
      );

      if (response.data['success'] == true) {
        return CommunityComment.fromJson(response.data['comment'] ?? response.data['data']);
      }
      throw Exception(response.data['error'] ?? 'Failed to add comment');
    } catch (e) {
      throw Exception('Failed to add comment: $e');
    }
  }
}

