import * as SQLite from 'expo-sqlite';

export interface FishingTrip {
  id?: number;
  date: string;
  startTime: string;
  endTime?: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  weather?: string;
  temperature?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Catch {
  id?: number;
  tripId: number;
  species: string;
  length?: number;
  weight?: number;
  bait?: string;
  lure?: string;
  method?: string;
  time: string;
  photoUri?: string;
  notes?: string;
  released: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('fishlog.db');
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create fishing trips table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS fishing_trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        location_name TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        weather TEXT,
        temperature REAL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Create catches table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS catches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        species TEXT NOT NULL,
        length REAL,
        weight REAL,
        bait TEXT,
        lure TEXT,
        method TEXT,
        time TEXT NOT NULL,
        photo_uri TEXT,
        notes TEXT,
        released INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES fishing_trips (id) ON DELETE CASCADE
      );
    `);

    // Create locations table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        description TEXT,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Create indexes for better performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_fishing_trips_date ON fishing_trips(date);
      CREATE INDEX IF NOT EXISTS idx_catches_trip_id ON catches(trip_id);
      CREATE INDEX IF NOT EXISTS idx_catches_species ON catches(species);
      CREATE INDEX IF NOT EXISTS idx_locations_favorite ON locations(is_favorite);
    `);
  }

  // Fishing Trips CRUD operations
  async createTrip(trip: Omit<FishingTrip, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const result = await this.db.runAsync(
      `INSERT INTO fishing_trips 
       (date, start_time, end_time, location_name, latitude, longitude, weather, temperature, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trip.date,
        trip.startTime,
        trip.endTime || null,
        trip.locationName,
        trip.latitude || null,
        trip.longitude || null,
        trip.weather || null,
        trip.temperature || null,
        trip.notes || null,
        now,
        now,
      ]
    );

    return result.lastInsertRowId;
  }

  async getTrips(limit?: number, offset?: number): Promise<FishingTrip[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT id, date, start_time as startTime, end_time as endTime, 
             location_name as locationName, latitude, longitude, weather, 
             temperature, notes, created_at as createdAt, updated_at as updatedAt
      FROM fishing_trips 
      ORDER BY date DESC, start_time DESC
    `;

    if (limit) {
      query += ` LIMIT ${limit}`;
      if (offset) {
        query += ` OFFSET ${offset}`;
      }
    }

    const result = await this.db.getAllAsync(query);
    return result as FishingTrip[];
  }

  async getTripById(id: number): Promise<FishingTrip | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      `SELECT id, date, start_time as startTime, end_time as endTime, 
              location_name as locationName, latitude, longitude, weather, 
              temperature, notes, created_at as createdAt, updated_at as updatedAt
       FROM fishing_trips WHERE id = ?`,
      [id]
    );

    return result as FishingTrip | null;
  }

  async updateTrip(id: number, updates: Partial<FishingTrip>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const fields = [];
    const values = [];

    if (updates.date) {
      fields.push('date = ?');
      values.push(updates.date);
    }
    if (updates.startTime) {
      fields.push('start_time = ?');
      values.push(updates.startTime);
    }
    if (updates.endTime !== undefined) {
      fields.push('end_time = ?');
      values.push(updates.endTime);
    }
    if (updates.locationName) {
      fields.push('location_name = ?');
      values.push(updates.locationName);
    }
    if (updates.latitude !== undefined) {
      fields.push('latitude = ?');
      values.push(updates.latitude);
    }
    if (updates.longitude !== undefined) {
      fields.push('longitude = ?');
      values.push(updates.longitude);
    }
    if (updates.weather !== undefined) {
      fields.push('weather = ?');
      values.push(updates.weather);
    }
    if (updates.temperature !== undefined) {
      fields.push('temperature = ?');
      values.push(updates.temperature);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await this.db.runAsync(
      `UPDATE fishing_trips SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteTrip(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM fishing_trips WHERE id = ?', [id]);
  }

  // Catches CRUD operations
  async createCatch(catch_: Omit<Catch, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const result = await this.db.runAsync(
      `INSERT INTO catches 
       (trip_id, species, length, weight, bait, lure, method, time, photo_uri, notes, released, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        catch_.tripId,
        catch_.species,
        catch_.length || null,
        catch_.weight || null,
        catch_.bait || null,
        catch_.lure || null,
        catch_.method || null,
        catch_.time,
        catch_.photoUri || null,
        catch_.notes || null,
        catch_.released ? 1 : 0,
        now,
        now,
      ]
    );

    return result.lastInsertRowId;
  }

  async getCatchesByTripId(tripId: number): Promise<Catch[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      `SELECT id, trip_id as tripId, species, length, weight, bait, lure, method, 
              time, photo_uri as photoUri, notes, released, 
              created_at as createdAt, updated_at as updatedAt
       FROM catches WHERE trip_id = ? ORDER BY time ASC`,
      [tripId]
    );

    return (result as any[]).map(row => ({
      ...row,
      released: row.released === 1,
    })) as Catch[];
  }

  async getAllCatches(limit?: number, offset?: number): Promise<Catch[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT id, trip_id as tripId, species, length, weight, bait, lure, method, 
             time, photo_uri as photoUri, notes, released, 
             created_at as createdAt, updated_at as updatedAt
      FROM catches ORDER BY created_at DESC
    `;

    if (limit) {
      query += ` LIMIT ${limit}`;
      if (offset) {
        query += ` OFFSET ${offset}`;
      }
    }

    const result = await this.db.getAllAsync(query);
    return (result as any[]).map(row => ({
      ...row,
      released: row.released === 1,
    })) as Catch[];
  }

  async updateCatch(id: number, updates: Partial<Catch>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const fields = [];
    const values = [];

    if (updates.species) {
      fields.push('species = ?');
      values.push(updates.species);
    }
    if (updates.length !== undefined) {
      fields.push('length = ?');
      values.push(updates.length);
    }
    if (updates.weight !== undefined) {
      fields.push('weight = ?');
      values.push(updates.weight);
    }
    if (updates.bait !== undefined) {
      fields.push('bait = ?');
      values.push(updates.bait);
    }
    if (updates.lure !== undefined) {
      fields.push('lure = ?');
      values.push(updates.lure);
    }
    if (updates.method !== undefined) {
      fields.push('method = ?');
      values.push(updates.method);
    }
    if (updates.time) {
      fields.push('time = ?');
      values.push(updates.time);
    }
    if (updates.photoUri !== undefined) {
      fields.push('photo_uri = ?');
      values.push(updates.photoUri);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    if (updates.released !== undefined) {
      fields.push('released = ?');
      values.push(updates.released ? 1 : 0);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await this.db.runAsync(
      `UPDATE catches SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteCatch(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM catches WHERE id = ?', [id]);
  }

  // Statistics and analytics
  async getTripStats(): Promise<{
    totalTrips: number;
    totalCatches: number;
    avgCatchesPerTrip: number;
    favoriteSpecies: string | null;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const totalTrips = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM fishing_trips'
    );

    const totalCatches = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM catches'
    );

    const favoriteSpecies = await this.db.getFirstAsync(
      'SELECT species, COUNT(*) as count FROM catches GROUP BY species ORDER BY count DESC LIMIT 1'
    );

    const tripsCount = (totalTrips as any)?.count || 0;
    const catchesCount = (totalCatches as any)?.count || 0;

    return {
      totalTrips: tripsCount,
      totalCatches: catchesCount,
      avgCatchesPerTrip: tripsCount > 0 ? catchesCount / tripsCount : 0,
      favoriteSpecies: (favoriteSpecies as any)?.species || null,
    };
  }

  async getSpeciesStats(): Promise<{ species: string; count: number }[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT species, COUNT(*) as count FROM catches GROUP BY species ORDER BY count DESC'
    );

    return result as { species: string; count: number }[];
  }

  // Locations CRUD operations
  async createLocation(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const result = await this.db.runAsync(
      `INSERT INTO locations 
       (name, latitude, longitude, description, is_favorite, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        location.name,
        location.latitude,
        location.longitude,
        location.description || null,
        location.isFavorite ? 1 : 0,
        now,
        now,
      ]
    );

    return result.lastInsertRowId;
  }

  async getLocations(favoritesOnly = false): Promise<Location[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT id, name, latitude, longitude, description, is_favorite as isFavorite,
             created_at as createdAt, updated_at as updatedAt
      FROM locations
    `;

    if (favoritesOnly) {
      query += ' WHERE is_favorite = 1';
    }

    query += ' ORDER BY name ASC';

    const result = await this.db.getAllAsync(query);
    return (result as any[]).map(row => ({
      ...row,
      isFavorite: row.isFavorite === 1,
    })) as Location[];
  }
}

export const databaseService = new DatabaseService();