class CollectionManager {
  constructor() {
    this.collections = {}
  }

  mountCollection(collection) {
    if (!this.collections[collection._id]) {
      this.collections[collection._id] = new Mongo.Collection(collection.name);
      Meteor.call('mountCollection', collection._id);
    }

    //log('> monted collections', this.collections);
    return this.collections[collection._id];
  }

  mountCollectionOnServer(collectionId) {
    if (Meteor.isServer) {
      let collection = Collections.findOne(collectionId);
      let database = collection.database();
      let connection = database.connection();
      if (!connection || !database || !collection) return false;

      if (!Mongo.Collection.get(collection.name)) {
        let driver = new MongoInternals.RemoteCollectionDriver('mongodb://' + connection.host + ':' + connection.port + '/' + database.name);
        new Mongo.Collection(collection.name, {_driver: driver});
      }
    }
  }

  mountAllCollections(database) {
    var mountedCollections = {};
    Collections.find({database_id: database._id}).forEach((collection) => {
      MountedCollections[collection._id] = new Mongo.Collection(collection.name);
    })
    Meteor.call('mountAllCollections', database._id);
    this.collections = MountedCollections
    return MountedCollections;
  }

  mountAllCollectionsOnServer(databaseId) {
    if (Meteor.isServer) {
      let database = Databases.findOne(databaseId);
      let connection = database.connection();
      if (!connection || !database) return false;

      let driver = new MongoInternals.RemoteCollectionDriver('mongodb://' + connection.host + ':' + connection.port + '/' + database.name);

      Collections.find({database_id: database._id}).forEach((collection) => {
        if (!Mongo.Collection.get(collection.name)) {
          new Mongo.Collection(collection.name, {_driver: driver});
        }
      })
    }
  }

}

cm = new CollectionManager();
