/**
 * GamePage - Main game entry point
 * 
 * This page now uses the new enhanced PigLifeGame component
 * which includes all features:
 * - Beautiful UI with animations
 * - Pig farming system
 * - Social actions
 * - Farming & harvesting
 * - Building & CEO race
 * - Walrus backup integration
 */

import { PigLifeGame } from "../components/piglife";

export function GamePage() {
  return <PigLifeGame />;
}
