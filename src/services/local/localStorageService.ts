
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for entities stored in localStorage
 */
export interface LocalStorageEntity {
  id: string;
  [key: string]: any;
}

/**
 * Base class for localStorage services
 * Provides CRUD operations for entities in localStorage
 */
export class LocalStorageService<T extends LocalStorageEntity> {
  protected storageKey: string;
  
  constructor(entityName: string) {
    this.storageKey = `app_${entityName}`;
  }
  
  /**
   * Get all entities from localStorage
   * @returns Array of entities
   */
  async getAll(): Promise<T[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error retrieving ${this.storageKey} from localStorage:`, error);
      return [];
    }
  }
  
  /**
   * Set all entities in localStorage (replaces all existing data)
   * @param entities Array of entities to save
   */
  async setAll(entities: T[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(entities));
    } catch (error) {
      console.error(`Error setting ${this.storageKey} in localStorage:`, error);
      throw error;
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
   * If the entity already has an ID, it will be used
   * Otherwise, a new UUID will be generated
   * @param entity Entity data
   * @returns ID of the entity
   */
  async add(entity: Partial<T> & { id?: string }): Promise<string> {
    try {
      const entities = await this.getAll();
      const id = entity.id || uuidv4();
      const newEntity = { ...entity, id } as T;
      
      entities.push(newEntity);
      localStorage.setItem(this.storageKey, JSON.stringify(entities));
      
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
      const index = entities.findIndex(e => e.id === id);
      
      if (index === -1) {
        throw new Error(`Entity with ID ${id} not found in ${this.storageKey}`);
      }
      
      entities[index] = { ...entities[index], ...entity };
      localStorage.setItem(this.storageKey, JSON.stringify(entities));
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
      const filteredEntities = entities.filter(entity => entity.id !== id);
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredEntities));
    } catch (error) {
      console.error(`Error deleting entity ${id} from ${this.storageKey}:`, error);
      throw error;
    }
  }
  
  /**
   * Initialize with default data if empty
   * @param defaultData Default data to use if storage is empty
   */
  async initializeWithDefault(defaultData: T[]): Promise<void> {
    try {
      const current = await this.getAll();
      
      if (current.length === 0) {
        localStorage.setItem(this.storageKey, JSON.stringify(defaultData));
      }
    } catch (error) {
      console.error(`Error initializing ${this.storageKey} with default data:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all entities
   */
  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error(`Error clearing ${this.storageKey}:`, error);
      throw error;
    }
  }
}
