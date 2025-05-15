
import { v4 as uuidv4 } from 'uuid';

/**
 * Generic local storage service for CRUD operations
 */
export class LocalStorageService<T extends { id: string }> {
  private storageKey: string;
  
  constructor(entityName: string) {
    this.storageKey = `app_${entityName}`;
  }
  
  /**
   * Get all entities from local storage
   * @returns Array of entities
   */
  async getAll(): Promise<T[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      return JSON.parse(data) as T[];
    } catch (error) {
      console.error(`Error retrieving ${this.storageKey} from localStorage:`, error);
      return [];
    }
  }
  
  /**
   * Get entity by ID
   * @param id Entity ID
   * @returns Entity or null if not found
   */
  async getById(id: string): Promise<T | null> {
    try {
      const entities = await this.getAll();
      return entities.find(entity => entity.id === id) || null;
    } catch (error) {
      console.error(`Error retrieving entity ${id} from ${this.storageKey}:`, error);
      return null;
    }
  }
  
  /**
   * Add a new entity
   * @param entity Entity data (without ID)
   * @returns Generated ID
   */
  async add(entity: Omit<T, 'id'>): Promise<string> {
    try {
      const entities = await this.getAll();
      const id = uuidv4();
      const newEntity = { ...entity, id } as T;
      
      const updatedEntities = [...entities, newEntity];
      localStorage.setItem(this.storageKey, JSON.stringify(updatedEntities));
      
      console.log(`Added entity to ${this.storageKey}:`, newEntity);
      return id;
    } catch (error) {
      console.error(`Error adding entity to ${this.storageKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Update an existing entity
   * @param id Entity ID
   * @param entity Updated entity data
   */
  async update(id: string, entity: Partial<T>): Promise<void> {
    try {
      const entities = await this.getAll();
      const entityIndex = entities.findIndex(e => e.id === id);
      
      if (entityIndex === -1) {
        throw new Error(`Entity with ID ${id} not found in ${this.storageKey}`);
      }
      
      const updatedEntity = { ...entities[entityIndex], ...entity };
      const updatedEntities = [
        ...entities.slice(0, entityIndex),
        updatedEntity,
        ...entities.slice(entityIndex + 1)
      ];
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedEntities));
      console.log(`Updated entity in ${this.storageKey}:`, updatedEntity);
    } catch (error) {
      console.error(`Error updating entity ${id} in ${this.storageKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete an entity
   * @param id Entity ID
   */
  async delete(id: string): Promise<void> {
    try {
      const entities = await this.getAll();
      const updatedEntities = entities.filter(entity => entity.id !== id);
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedEntities));
      console.log(`Deleted entity ${id} from ${this.storageKey}`);
    } catch (error) {
      console.error(`Error deleting entity ${id} from ${this.storageKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Query entities with filters
   * @param filters Object with key-value pairs to filter by
   * @returns Filtered entities
   */
  async query(filters: Partial<T>): Promise<T[]> {
    try {
      const entities = await this.getAll();
      
      return entities.filter(entity => {
        return Object.entries(filters).every(([key, value]) => {
          return entity[key as keyof T] === value;
        });
      });
    } catch (error) {
      console.error(`Error querying ${this.storageKey}:`, error);
      return [];
    }
  }
  
  /**
   * Clear all entities
   */
  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
      console.log(`Cleared all entities from ${this.storageKey}`);
    } catch (error) {
      console.error(`Error clearing ${this.storageKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Initialize with default data if empty
   * @param defaultData Default data to initialize with
   */
  async initializeWithDefault(defaultData: T[]): Promise<void> {
    try {
      const currentData = await this.getAll();
      
      if (currentData.length === 0) {
        localStorage.setItem(this.storageKey, JSON.stringify(defaultData));
        console.log(`Initialized ${this.storageKey} with default data:`, defaultData);
      }
    } catch (error) {
      console.error(`Error initializing ${this.storageKey}:`, error);
    }
  }
}
