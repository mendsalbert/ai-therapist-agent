import 'package:flutter/material.dart';

class MoodSelector extends StatelessWidget {
  final int selectedMood;
  final ValueChanged<int> onMoodSelected;

  const MoodSelector({
    super.key,
    required this.selectedMood,
    required this.onMoodSelected,
  });

  static const List<String> moodEmojis = [
    '😢', '😔', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳', '🌟'
  ];

  static const List<String> moodLabels = [
    'Very Low', 'Low', 'Below Average', 'Average', 'Above Average',
    'Good', 'Great', 'Excellent', 'Amazing', 'Perfect'
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'How are you feeling?',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: List.generate(10, (index) {
            final mood = index + 1;
            final isSelected = mood == selectedMood;
            
            return GestureDetector(
              onTap: () => onMoodSelected(mood),
              child: Container(
                width: 60,
                height: 80,
                decoration: BoxDecoration(
                  color: isSelected
                      ? Theme.of(context).colorScheme.primary.withOpacity(0.2)
                      : Colors.transparent,
                  border: Border.all(
                    color: isSelected
                        ? Theme.of(context).colorScheme.primary
                        : Colors.grey.withOpacity(0.3),
                    width: isSelected ? 2 : 1,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      moodEmojis[index],
                      style: const TextStyle(fontSize: 32),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      mood.toString(),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),
        if (selectedMood > 0) ...[
          const SizedBox(height: 12),
          Text(
            moodLabels[selectedMood - 1],
            style: TextStyle(
              fontSize: 14,
              color: Theme.of(context).colorScheme.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ],
    );
  }
}

