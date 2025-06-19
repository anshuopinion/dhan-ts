import { MultiConnectionDemo } from './demo-for-multiple';
import * as fs from 'fs';
import * as path from 'path';

describe('MultiConnectionDemo', () => {
  let demo: MultiConnectionDemo;

  beforeEach(() => {
    demo = new MultiConnectionDemo(true, 10); // Mock mode, 10 instruments
  });

  afterEach(() => {
    if (demo) {
      // @ts-ignore - accessing private method for cleanup
      demo.cleanup();
    }
  });

  test('should create demo instance', () => {
    expect(demo).toBeDefined();
    expect(demo).toBeInstanceOf(MultiConnectionDemo);
  });

  test('should load instruments from scanner file', () => {
    // Check if scanner file exists
    const scannerPath = path.join(__dirname, 'scanner.instruments.json');
    expect(fs.existsSync(scannerPath)).toBe(true);

    // Test file structure
    const content = fs.readFileSync(scannerPath, 'utf8');
    const data = JSON.parse(content);
    
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    
    if (data.length > 0) {
      const firstItem = data[0];
      expect(firstItem).toHaveProperty('secId');
      expect(firstItem).toHaveProperty('symbol');
      expect(firstItem).toHaveProperty('nameOfCompany');
    }
  });

  test('should handle instrument conversion', () => {
    // Mock scanner data
    const mockData = [
      {
        _id: { $oid: 'test' },
        secId: '123',
        symbol: 'TEST',
        custom: 'Test Stock',
        nameOfCompany: 'Test Company',
        __v: 0,
        createdAt: { $date: '2023-01-01' },
        updatedAt: { $date: '2023-01-01' }
      }
    ];

    // Use reflection to test private method
    const convertMethod = (demo as any).convertToInstruments;
    const instruments = convertMethod.call(demo, mockData);
    
    expect(instruments).toHaveLength(1);
    expect(instruments[0]).toEqual([1, '123']); // NSE_EQ, secId
  });
});
