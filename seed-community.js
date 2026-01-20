// Quick script to seed your community spaces
// Run this from the Hope-backend directory

const mongoose = require('mongoose');
require('dotenv').config();

const seedCommunityData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-therapy');
    console.log('Connected to MongoDB');

    // Import models
    const { CommunitySpace, CommunityPrompt, CommunityChallenge } = require('./dist/models/Community');

    // Clear existing data
    await CommunitySpace.deleteMany({});
    await CommunityPrompt.deleteMany({});
    await CommunityChallenge.deleteMany({});
    console.log('Cleared existing community data');

    // Your spaces will be seeded here
    // The TypeScript has been compiled to dist/
    const seedScript = require('./dist/scripts/seedCommunity');
    
    await seedScript.default();
    console.log('✅ Community spaces seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding community data:', error);
    process.exit(1);
  }
};

seedCommunityData();

