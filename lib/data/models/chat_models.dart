import 'package:equatable/equatable.dart';

class ChatMessageModel extends Equatable {
  final String role;
  final String content;
  final DateTime timestamp;
  final ChatMetadata? metadata;

  const ChatMessageModel({
    required this.role,
    required this.content,
    required this.timestamp,
    this.metadata,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      role: json['role'] ?? 'assistant',
      content: json['content'] ?? '',
      timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
      metadata: json['metadata'] != null ? ChatMetadata.fromJson(json['metadata']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'role': role,
      'content': content,
      'timestamp': timestamp.toIso8601String(),
      if (metadata != null) 'metadata': metadata!.toJson(),
    };
  }

  ChatMessageModel copyWith({
    String? role,
    String? content,
    DateTime? timestamp,
    ChatMetadata? metadata,
  }) {
    return ChatMessageModel(
      role: role ?? this.role,
      content: content ?? this.content,
      timestamp: timestamp ?? this.timestamp,
      metadata: metadata ?? this.metadata,
    );
  }

  @override
  List<Object?> get props => [role, content, timestamp, metadata];
}

class ChatMetadata extends Equatable {
  final String? technique;
  final String? goal;
  final List<dynamic>? progress;
  final ChatAnalysis? analysis;

  const ChatMetadata({
    this.technique,
    this.goal,
    this.progress,
    this.analysis,
  });

  factory ChatMetadata.fromJson(Map<String, dynamic> json) {
    return ChatMetadata(
      technique: json['technique'] as String?,
      goal: json['goal'] as String?,
      progress: json['progress'] as List<dynamic>?,
      analysis: json['analysis'] != null ? ChatAnalysis.fromJson(json['analysis']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (technique != null) 'technique': technique,
      if (goal != null) 'goal': goal,
      if (progress != null) 'progress': progress,
      if (analysis != null) 'analysis': analysis!.toJson(),
    };
  }

  @override
  List<Object?> get props => [technique, goal, progress, analysis];
}

class ChatAnalysis extends Equatable {
  final String? emotionalState;
  final List<String>? themes;
  final int? riskLevel;
  final String? recommendedApproach;
  final List<String>? progressIndicators;

  const ChatAnalysis({
    this.emotionalState,
    this.themes,
    this.riskLevel,
    this.recommendedApproach,
    this.progressIndicators,
  });

  factory ChatAnalysis.fromJson(Map<String, dynamic> json) {
    return ChatAnalysis(
      emotionalState: json['emotionalState'] as String?,
      themes: json['themes'] != null ? List<String>.from(json['themes']) : null,
      riskLevel: json['riskLevel'] as int?,
      recommendedApproach: json['recommendedApproach'] as String?,
      progressIndicators: json['progressIndicators'] != null
          ? List<String>.from(json['progressIndicators'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (emotionalState != null) 'emotionalState': emotionalState,
      if (themes != null) 'themes': themes,
      if (riskLevel != null) 'riskLevel': riskLevel,
      if (recommendedApproach != null) 'recommendedApproach': recommendedApproach,
      if (progressIndicators != null) 'progressIndicators': progressIndicators,
    };
  }

  @override
  List<Object?> get props => [
        emotionalState,
        themes,
        riskLevel,
        recommendedApproach,
        progressIndicators,
      ];
}

class ChatSessionModel extends Equatable {
  final String sessionId;
  final String? title;
  final List<ChatMessageModel> messages;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int messageCount;

  const ChatSessionModel({
    required this.sessionId,
    required this.messages,
    required this.createdAt,
    required this.updatedAt,
    this.title,
    this.messageCount = 0,
  });

  factory ChatSessionModel.fromJson(Map<String, dynamic> json) {
    final created = DateTime.tryParse(json['createdAt'] ?? json['startTime'] ?? '');
    final updated = DateTime.tryParse(json['updatedAt'] ?? json['startTime'] ?? '');

    return ChatSessionModel(
      sessionId: json['sessionId'] ?? json['_id'] ?? json['id'] ?? '',
      title: json['title'] as String?,
      messages: (json['messages'] as List<dynamic>? ?? [])
          .map((msg) => ChatMessageModel.fromJson(msg as Map<String, dynamic>))
          .toList(),
      createdAt: created ?? DateTime.now(),
      updatedAt: updated ?? DateTime.now(),
      messageCount: json['messageCount'] ??
          (json['messages'] != null ? (json['messages'] as List).length : 0),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sessionId': sessionId,
      'title': title,
      'messages': messages.map((m) => m.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'messageCount': messageCount,
    };
  }

  ChatSessionModel copyWith({
    String? sessionId,
    String? title,
    List<ChatMessageModel>? messages,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? messageCount,
  }) {
    return ChatSessionModel(
      sessionId: sessionId ?? this.sessionId,
      title: title ?? this.title,
      messages: messages ?? this.messages,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      messageCount: messageCount ?? this.messageCount,
    );
  }

  @override
  List<Object?> get props => [sessionId, title, messages, createdAt, updatedAt, messageCount];
}

