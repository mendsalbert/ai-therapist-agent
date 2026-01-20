import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/community_provider.dart';
import '../../widgets/gradient_button.dart';

class CreatePostScreen extends ConsumerStatefulWidget {
  const CreatePostScreen({super.key});

  @override
  ConsumerState<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends ConsumerState<CreatePostScreen> {
  final _formKey = GlobalKey<FormState>();
  final _contentController = TextEditingController();
  String? _selectedSpace;
  String? _selectedMood;
  bool _isAnonymous = false;
  bool _isLoading = false;

  final List<String> _spaces = [
    'Anxiety & Overthinking',
    'Depression & Low Mood',
    'Healing from Breakups',
    'Stress & Burnout',
    'Loneliness & Connection',
    'Mindful Living',
    'Gratitude & Positivity',
  ];

  final List<Map<String, String>> _moods = [
    {'value': 'grateful', 'label': '🙏 Grateful'},
    {'value': 'hopeful', 'label': '✨ Hopeful'},
    {'value': 'calm', 'label': '🕊️ Calm'},
    {'value': 'proud', 'label': '🌟 Proud'},
    {'value': 'peaceful', 'label': '🌙 Peaceful'},
    {'value': 'motivated', 'label': '🚀 Motivated'},
    {'value': 'anxious', 'label': '😰 Anxious'},
    {'value': 'sad', 'label': '😔 Sad'},
    {'value': 'happy', 'label': '😊 Happy'},
    {'value': 'excited', 'label': '🎉 Excited'},
  ];

  @override
  void dispose() {
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _createPost() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedSpace == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a community space')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await ref.read(communityFeedProvider.notifier).createPost(
        spaceId: _selectedSpace!,
        content: _contentController.text.trim(),
        mood: _selectedMood,
        isAnonymous: _isAnonymous,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Post created successfully')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Post'),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              DropdownButtonFormField<String>(
                value: _selectedSpace,
                decoration: const InputDecoration(
                  labelText: 'Community Space *',
                  hintText: 'Choose a space to post in',
                ),
                items: _spaces.map((space) {
                  return DropdownMenuItem(
                    value: space,
                    child: Text(space),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedSpace = value;
                  });
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _contentController,
                decoration: const InputDecoration(
                  labelText: "What's on your mind? *",
                  hintText: 'Share your thoughts, experiences, or ask for support...',
                  alignLabelWithHint: true,
                ),
                maxLines: 8,
                maxLength: 2000,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter some content';
                  }
                  if (value.length > 2000) {
                    return 'Content must be 2000 characters or less';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedMood,
                decoration: const InputDecoration(
                  labelText: 'Current Mood (Optional)',
                  hintText: 'How are you feeling?',
                ),
                items: _moods.map((mood) {
                  return DropdownMenuItem(
                    value: mood['value'],
                    child: Text(mood['label']!),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedMood = value;
                  });
                },
              ),
              const SizedBox(height: 16),
              CheckboxListTile(
                title: const Text('Post anonymously'),
                value: _isAnonymous,
                onChanged: (value) {
                  setState(() {
                    _isAnonymous = value ?? false;
                  });
                },
              ),
              const SizedBox(height: 32),
              GradientButton(
                text: 'Create Post',
                onPressed: _createPost,
                isLoading: _isLoading,
                icon: Icons.send,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
