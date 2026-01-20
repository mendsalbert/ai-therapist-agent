import 'package:hive_flutter/hive_flutter.dart';
import '../../services/api/meditation_service.dart';

class MeditationLocalStorage {
  static const String _boxName = 'meditations';

  Future<Box<Map>> _getBox() async {
    if (!Hive.isBoxOpen(_boxName)) {
      return await Hive.openBox<Map>(_boxName);
    }
    return Hive.box<Map>(_boxName);
  }

  Future<List<Meditation>> getMeditations() async {
    try {
      final box = await _getBox();
      final meditations = <Meditation>[];
      
      for (var key in box.keys) {
        final data = box.get(key);
        if (data != null) {
          try {
            meditations.add(Meditation.fromJson(Map<String, dynamic>.from(data)));
          } catch (e) {
            // Skip invalid entries
          }
        }
      }
      
      return meditations;
    } catch (e) {
      return [];
    }
  }

  Future<void> saveMeditations(List<Meditation> meditations) async {
    try {
      final box = await _getBox();
      await box.clear();
      
      for (var meditation in meditations) {
        await box.put(meditation.id, {
          'id': meditation.id,
          'title': meditation.title,
          'description': meditation.description,
          'duration': meditation.duration,
          'audioUrl': meditation.audioUrl,
          'category': meditation.category,
          'isPremium': meditation.isPremium,
          'tags': meditation.tags,
          'thumbnailUrl': meditation.thumbnailUrl,
        });
      }
    } catch (e) {
      // Handle error silently
    }
  }
}

