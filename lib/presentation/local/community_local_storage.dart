import 'package:hive_flutter/hive_flutter.dart';
import '../../services/api/community_service.dart';

class CommunityLocalStorage {
  static const String _boxName = 'community_posts';

  Future<Box<Map>> _getBox() async {
    if (!Hive.isBoxOpen(_boxName)) {
      return await Hive.openBox<Map>(_boxName);
    }
    return Hive.box<Map>(_boxName);
  }

  Future<List<CommunityPost>> getPosts() async {
    try {
      final box = await _getBox();
      final posts = <CommunityPost>[];
      
      for (var key in box.keys) {
        final data = box.get(key);
        if (data != null) {
          try {
            posts.add(CommunityPost.fromJson(Map<String, dynamic>.from(data)));
          } catch (e) {
            // Skip invalid entries
          }
        }
      }
      
      posts.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return posts;
    } catch (e) {
      return [];
    }
  }

  Future<void> savePosts(List<CommunityPost> posts) async {
    try {
      final box = await _getBox();
      await box.clear();
      
      for (var post in posts) {
        await box.put(post.id, {
          'id': post.id,
          'userId': post.userId,
          'username': post.username,
          'spaceId': post.spaceId,
          'content': post.content,
          'mood': post.mood,
          'isAnonymous': post.isAnonymous,
          'images': post.images,
          'reactions': post.reactions,
          'commentCount': post.commentCount,
          'aiReflection': post.aiReflection,
          'createdAt': post.createdAt.toIso8601String(),
        });
      }
    } catch (e) {
      // Handle error silently
    }
  }

  Future<void> savePost(CommunityPost post) async {
    try {
      final box = await _getBox();
      await box.put(post.id, {
        'id': post.id,
        'userId': post.userId,
        'username': post.username,
        'spaceId': post.spaceId,
        'content': post.content,
        'mood': post.mood,
        'isAnonymous': post.isAnonymous,
        'images': post.images,
        'reactions': post.reactions,
        'commentCount': post.commentCount,
        'aiReflection': post.aiReflection,
        'createdAt': post.createdAt.toIso8601String(),
      });
    } catch (e) {
      // Handle error silently
    }
  }
}

