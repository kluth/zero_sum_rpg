import { CharacterCreationAdapter } from '../../src/adapters/CharacterCreationAdapter';
import { EverydayHero } from '../../src/workforce/EverydayHero';

describe('CharacterCreationAdapter', () => {
  it('should successfully parse a valid creation request with freeform JobTags', () => {
    const request = {
      playerId: 'player-1',
      characterName: 'Medic John',
      jobTags: ['Pflegekraft', 'Nachtschicht']
    };

    const result = CharacterCreationAdapter.createCharacter(request);

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const hero = result.value;
      expect(hero.getId()).toBe('player-1');
      expect(hero.getName()).toBe('Medic John');
      expect(hero.hasJobTag('Pflegekraft')).toBe(true);
      expect(hero.hasJobTag('Nachtschicht')).toBe(true);
      // Ensure metrics are initialized
      expect(hero.getNervenkostuem().getValue()).toBe(100);
      expect(hero.getBurnoutMeter().getValue()).toBe(0);
      expect(hero.getKoffeinPegel().getValue()).toBe(100);
    }
  });

  it('should fail if character name is missing', () => {
    const request = {
      playerId: 'player-1',
      characterName: '',
      jobTags: ['Pflegekraft']
    };

    const result = CharacterCreationAdapter.createCharacter(request);

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error).toContain('Name cannot be empty.');
    }
  });

  it('should fail if a JobTag is invalid', () => {
    const request = {
      playerId: 'player-1',
      characterName: 'Medic John',
      jobTags: [''] // Invalid empty tag
    };

    const result = CharacterCreationAdapter.createCharacter(request);

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error).toContain('JobTag cannot be empty.');
    }
  });
});
