import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api/community_service.dart';
import '../local/community_local_storage.dart';

final communityServiceProvider = Provider<CommunityService>((ref) => CommunityService());
final communityLocalStorageProvider = Provider<CommunityLocalStorage>((ref) => CommunityLocalStorage());

final communityFeedProvider = StateNotifierProvider<CommunityFeedNotifier, AsyncValue<List<CommunityPost>>>((ref) {
  return CommunityFeedNotifier(
    ref.read(communityServiceProvider),
    ref.read(communityLocalStorageProvider),
  );
});

class CommunityFeedNotifier extends StateNotifier<AsyncValue<List<CommunityPost>>> {
  final CommunityService _communityService;
  final CommunityLocalStorage _localStorage;

  CommunityFeedNotifier(this._communityService, this._localStorage)
      : super(const AsyncValue.loading()) {
    loadFeed();
  }

  Future<void> loadFeed({bool useCache = true}) async {
    try {
      if (useCache) {
        final cached = await _localStorage.getPosts();
        if (cached.isNotEmpty) {
          state = AsyncValue.data(cached);
        }
      }

      final posts = await _communityService.getFeed();
      state = AsyncValue.data(posts);
      
      await _localStorage.savePosts(posts);
    } catch (e) {
      if (useCache) {
        final cached = await _localStorage.getPosts();
        if (cached.isNotEmpty) {
          state = AsyncValue.data(cached);
          return;
        }
      }
      state = AsyncValue.error(e, StackTrace.current);
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
      final post = await _communityService.createPost(
        spaceId: spaceId,
        content: content,
        mood: mood,
        isAnonymous: isAnonymous,
        images: images,
      );

      final current = state.value ?? [];
      state = AsyncValue.data([post, ...current]);
      
      await _localStorage.savePost(post);

      return post;
    } catch (e) {
      throw Exception('Failed to create post: $e');
    }
  }

  Future<void> reactToPost(String postId, String reactionType) async {
    try {
      await _communityService.reactToPost(postId, reactionType);
      await loadFeed(useCache: false);
    } catch (e) {
      // Handle error
    }
  }
}

