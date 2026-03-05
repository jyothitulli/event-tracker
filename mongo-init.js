// Initialize MongoDB with user and database
db = db.getSiblingDB('activity_db');

// Create application user
db.createUser({
  user: 'activity_user',
  pwd: 'activity_pass',
  roles: [
    {
      role: 'readWrite',
      db: 'activity_db'
    }
  ]
});

// Create collections with validation
db.createCollection('activities', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'userId', 'eventType', 'timestamp', 'payload'],
      properties: {
        id: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        userId: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        eventType: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        timestamp: {
          bsonType: 'date',
          description: 'must be a date and is required'
        },
        payload: {
          bsonType: 'object',
          description: 'must be an object and is required'
        }
      }
    }
  }
});

// Create indexes
db.activities.createIndex({ id: 1 }, { unique: true });
db.activities.createIndex({ userId: 1 });
db.activities.createIndex({ eventType: 1 });
db.activities.createIndex({ timestamp: -1 });
db.activities.createIndex({ userId: 1, timestamp: -1 });

print('MongoDB initialization completed');