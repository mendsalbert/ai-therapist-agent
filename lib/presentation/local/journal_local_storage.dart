import 'package:hive_flutter/hive_flutter.dart';
import '../../data/models/journal_entry_model.dart';

class JournalLocalStorage {
  static const String _boxName = 'journal_entries';

  Future<Box<Map>> _getBox() async {
    if (!Hive.isBoxOpen(_boxName)) {
      return await Hive.openBox<Map>(_boxName);
    }
    return Hive.box<Map>(_boxName);
  }

  Future<List<JournalEntryModel>> getEntries() async {
    try {
      final box = await _getBox();
      final entries = <JournalEntryModel>[];
      
      for (var key in box.keys) {
        final data = box.get(key);
        if (data != null) {
          try {
            entries.add(JournalEntryModel.fromJson(Map<String, dynamic>.from(data)));
          } catch (e) {
            // Skip invalid entries
          }
        }
      }
      
      // Sort by date, newest first
      entries.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return entries;
    } catch (e) {
      return [];
    }
  }

  Future<void> saveEntries(List<JournalEntryModel> entries) async {
    try {
      final box = await _getBox();
      await box.clear();
      
      for (var entry in entries) {
        await box.put(entry.id, entry.toJson());
      }
    } catch (e) {
      // Handle error silently
    }
  }

  Future<void> saveEntry(JournalEntryModel entry) async {
    try {
      final box = await _getBox();
      await box.put(entry.id, entry.toJson());
    } catch (e) {
      // Handle error silently
    }
  }

  Future<void> deleteEntry(String id) async {
    try {
      final box = await _getBox();
      await box.delete(id);
    } catch (e) {
      // Handle error silently
    }
  }

  Future<void> clear() async {
    try {
      final box = await _getBox();
      await box.clear();
    } catch (e) {
      // Handle error silently
    }
  }
}

