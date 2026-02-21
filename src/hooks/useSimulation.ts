import { useEffect, useRef } from 'react';
import { startSimulation, stopSimulation } from '../simulation/SimulationEngine';

/**
 * Hook to start/stop the simulation engine.
 * The simulation runs for the lifetime of the component using this hook.
 */
export function useSimulation() {
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      startSimulation();
    }

    return () => {
      stopSimulation();
      started.current = false;
    };
  }, []);
}
