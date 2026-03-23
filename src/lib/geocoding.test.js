import { describe, it, expect } from 'vitest';
import { cleanAddressForGeocoding, extractAddressComponents } from './geocoding';

describe('cleanAddressForGeocoding', () => {
  it('returns empty string for null/undefined/empty input', () => {
    expect(cleanAddressForGeocoding(null)).toBe('');
    expect(cleanAddressForGeocoding(undefined)).toBe('');
    expect(cleanAddressForGeocoding('')).toBe('');
  });

  it('removes business name prefix before " - "', () => {
    const input = 'RUDH Hearing and Speech Clinic - Aanand Tower, No54, Bowring Hospital Rd, Bengaluru, Karnataka 560001';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('RUDH Hearing and Speech Clinic');
    expect(result).toContain('Bowring Hospital Rd');
  });

  it('removes business name prefix before ": "', () => {
    const input = 'Aruna Chetana (Malleswaram) Bengaluru : 14th A Cross Road, 56, 11th Main Rd, Malleshwaram, Bengaluru, Karnataka 560003';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('Aruna Chetana');
    expect(result).toContain('14th A Cross Road');
  });

  it('removes parenthetical landmark info', () => {
    const input = 'Shop No 8, Pranava Complex, 5th Cross, Malleswaram, Bangalore - 560003 (Opposite Brand Factory,Next Big Bazar)';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('Opposite Brand Factory');
    expect(result).not.toContain('Next Big Bazar');
  });

  it('removes "near" landmark phrases', () => {
    const input = '81/2, A N Krishnarao Road, near Jain College, V V Puram, Bengaluru, Karnataka 560004';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('near Jain College');
    expect(result).toContain('A N Krishnarao Road');
  });

  it('removes "next to" landmark phrases', () => {
    const input = '9, Shankar Mutt Rd, next to Shankarapuram, Chikkanna Garden, Basavanagudi, Bengaluru, Karnataka 560004';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('next to Shankarapuram');
    expect(result).toContain('Shankar Mutt Rd');
  });

  it('removes "opposite" / "opp" landmark phrases', () => {
    const input = 'Road, Arekere Main Rd, opp. Reliance Mart, Adi Bhyrava Layout, Bengaluru, Karnataka 560076';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('opp. Reliance Mart');
  });

  it('removes "behind" / "above" / "below" landmark phrases', () => {
    const input = '363 SSA Road, Behind Hebbal Police Station, Cholanyakanahalli, Bangalore-560032';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('Behind Hebbal Police Station');
    expect(result).toContain('363 SSA Road');
  });

  it('removes floor information', () => {
    const input = 'No.6, Ground floor, Chitrapur Bhavan, 8th Main, 15th Cross, Malleswaram, Bangalore - 560003';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toMatch(/ground floor/i);
    expect(result).toContain('8th Main');
    expect(result).toContain('Malleswaram');
  });

  it('removes numbered floor info like "2nd floor"', () => {
    const input = '2nd floor, SONA STATURE, KPTCL Layout road, Kaikondrahalli, Bengaluru, Karnataka 560035';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toMatch(/2nd floor/i);
  });

  it('removes plus codes', () => {
    const input = 'WF2W+2VM, Dr.Vishnuvardhan Rd, Kengeri, Bengaluru, Karnataka 560060';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('WF2W+2VM');
    expect(result).toContain('Dr.Vishnuvardhan Rd');
  });

  it('removes distance info like "(1,737.93 km)"', () => {
    const input = 'No 9, Omega Avenue, Mathrushree Layout, (1,737.93 km) 560035 Bangalore, India';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('1,737.93 km');
  });

  it('removes # prefix from building numbers', () => {
    const input = '#456, 9th A Main Road, Jayanagar 2nd Block, Bangalore, Karnataka 560011';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('#');
    expect(result).toContain('456');
  });

  it('removes "Pincode -" prefix', () => {
    const input = '45, 5th Main Road, Bengaluru, Karnataka, Pincode - 560016';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('Pincode');
    expect(result).toContain('560016');
  });

  it('removes trailing "India"', () => {
    const input = '11, Srinivas Reddy layout, Chinnappan Halli, Bangalore, India, Karnataka 560037';
    const result = cleanAddressForGeocoding(input);
    // Should not end with "India"
    expect(result).not.toMatch(/India\s*$/);
  });

  it('removes trailing period', () => {
    const input = '#456, 9th A Main Road, Jayanagar 2nd Block, Bangalore, Karnataka 560011.';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toMatch(/\.$/);
  });

  it('normalizes Karnātaka to Karnataka', () => {
    const input = '1st Cross,Shankarapuram, Bengaluru-560004, Karnātaka';
    const result = cleanAddressForGeocoding(input);
    expect(result).toContain('Karnataka');
    expect(result).not.toContain('Karnātaka');
  });

  it('removes double quotes', () => {
    const input = 'No.9 ""Sugnana"" Rear Block 1st Floor 1st Main Road, Ganga Nagar, Bengaluru, Karnataka 560032';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('"');
  });

  it('replaces en-dash and em-dash with regular dash', () => {
    const input = 'Bangalore – 560010 Next to Ananya Hospital';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toContain('–');
  });

  it('removes shop/flat/unit numbers', () => {
    const input = 'Shop No 8, Pranava Complex, 5th Cross, Malleswaram, Bangalore 560003';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toMatch(/Shop No 8/i);
  });

  it('cleans up multiple commas and extra spaces', () => {
    const input = 'Some Place, , , Bengaluru,  , Karnataka 560001';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toMatch(/,\s*,/);
    expect(result).not.toMatch(/  /);
  });

  it('handles complex real-world address from error CSV', () => {
    const input = 'Navrang Speech & Hearing Clinic-Shop No 8, Pranava Complex, 5th Cross, Malleswaram, Bangalore - 560003 (Opposite Brand Factory,Next Big Bazar)';
    const result = cleanAddressForGeocoding(input);
    // Should have removed business name, shop number, and parenthetical landmark
    expect(result).not.toContain('Navrang Speech');
    expect(result).not.toContain('Opposite Brand Factory');
    expect(result).toContain('Malleswaram');
  });

  it('handles address with business name prefix using hyphen (no spaces)', () => {
    const input = 'Perseverance-50, 1st Cross Rd, 1st Block, 1st Stage, HBR Layout, Bengaluru, Karnataka 560043';
    const result = cleanAddressForGeocoding(input);
    expect(result).toContain('1st Cross Rd');
  });

  it('handles address with "above" landmark', () => {
    const input = 'Suite no 1, 1st Floor, 1AA Cross Road, 2nd Main Rd, above Medplus, Kasturi Nagar, Bengaluru, Karnataka 560043';
    const result = cleanAddressForGeocoding(input);
    expect(result).not.toMatch(/above Medplus/i);
  });
});

describe('extractAddressComponents', () => {
  it('returns empty components for null/undefined/empty input', () => {
    expect(extractAddressComponents(null)).toEqual({ city: '', state: '', zipCode: '' });
    expect(extractAddressComponents(undefined)).toEqual({ city: '', state: '', zipCode: '' });
    expect(extractAddressComponents('')).toEqual({ city: '', state: '', zipCode: '' });
  });

  it('extracts Indian pincode (6 digits)', () => {
    const result = extractAddressComponents('Some address, Bengaluru, Karnataka 560001');
    expect(result.zipCode).toBe('560001');
  });

  it('extracts Karnataka state', () => {
    const result = extractAddressComponents('Some address, Bengaluru, Karnataka 560001');
    expect(result.state).toBe('Karnataka');
  });

  it('extracts state with diacritics (Karnātaka)', () => {
    const result = extractAddressComponents('1st Cross, Bengaluru-560004, Karnātaka');
    expect(result.state).toMatch(/Karnataka/i);
  });

  it('extracts Bengaluru city', () => {
    const result = extractAddressComponents('Some address, Bengaluru, Karnataka 560001');
    expect(result.city).toBe('Bengaluru');
  });

  it('normalizes Bangalore to Bengaluru', () => {
    const result = extractAddressComponents('Some address, Bangalore 560001');
    expect(result.city).toBe('Bengaluru');
  });

  it('normalizes Bombay to Mumbai', () => {
    const result = extractAddressComponents('Some address, Bombay, Maharashtra 400001');
    expect(result.city).toBe('Mumbai');
  });

  it('normalizes Madras to Chennai', () => {
    const result = extractAddressComponents('Some address, Madras, Tamil Nadu 600001');
    expect(result.city).toBe('Chennai');
  });

  it('extracts all components from a full address', () => {
    const result = extractAddressComponents(
      'RUDH Hearing and Speech Clinic - Aanand Tower, No54, Bowring Hospital Rd, Bengaluru, Karnataka 560001'
    );
    expect(result.city).toBe('Bengaluru');
    expect(result.state).toBe('Karnataka');
    expect(result.zipCode).toBe('560001');
  });

  it('extracts pincode from address with "Pincode -" prefix', () => {
    const result = extractAddressComponents(
      '45, 5th Main Road, Bengaluru, Karnataka, Pincode - 560016'
    );
    expect(result.zipCode).toBe('560016');
  });

  it('extracts components from address with alternate city spelling', () => {
    const result = extractAddressComponents(
      'Pipeline Road, Yeshwanthpur Bangalore 560022'
    );
    expect(result.city).toBe('Bengaluru');
    expect(result.zipCode).toBe('560022');
  });

  it('handles address with no recognizable city', () => {
    const result = extractAddressComponents('123 Main St, Some Town, Karnataka 560001');
    expect(result.city).toBe('');
    expect(result.state).toBe('Karnataka');
    expect(result.zipCode).toBe('560001');
  });

  it('handles address with no pincode', () => {
    const result = extractAddressComponents('Some address, Bengaluru, Karnataka');
    expect(result.city).toBe('Bengaluru');
    expect(result.state).toBe('Karnataka');
    expect(result.zipCode).toBe('');
  });
});
