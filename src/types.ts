export enum Type {
  GRASS = "grass",
  GROUND = "ground",
  FIRE = "fire",
  FIGHTING = "fighting",
  WATER = "water",
  STEEL = "steel",
  NORMAL = "normal",
  FLYING = "flying",
  BUG = "bug",
  ELECTRIC = "electric",
  PSYCHIC = "psychic",
  POISON = "poison",
  ROCK = "rock",
  GHOST = "ghost",
  DARK = "dark",
  FAIRY = "fairy",
  DRAGON = "dragon",
  ICE = "ice",
}

export interface PokemonData {
  name: string;
  sprite: string;
  types: [Type] | [Type, Type];
  dexNumber: number;
  regionalDexNumber: number | null;
  locations: ReadonlyArray<string>;
}
