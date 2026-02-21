/**
 * NetworkSimulator - Simule la latence réseau et la perte de paquets
 * 
 * Chaque opération est retardée d'un temps aléatoire entre MIN_LATENCY et MAX_LATENCY.
 * 1% des paquets sont "perdus" et doivent être retentés.
 */

const MIN_LATENCY = 100;
const MAX_LATENCY = 1500;
const PACKET_LOSS_RATE = 0.01;
const MAX_RETRIES = 3;

export interface NetworkResult<T> {
  success: boolean;
  data?: T;
  latency: number;
  retries: number;
}

export class NetworkSimulator {
  private currentLatency: number = 0;
  private onLatencyChange?: (latency: number) => void;
  private onPacketSent?: (lost: boolean) => void;

  constructor(
    onLatencyChange?: (latency: number) => void,
    onPacketSent?: (lost: boolean) => void
  ) {
    this.onLatencyChange = onLatencyChange;
    this.onPacketSent = onPacketSent;
  }

  private getRandomLatency(): number {
    return Math.floor(Math.random() * (MAX_LATENCY - MIN_LATENCY) + MIN_LATENCY);
  }

  private isPacketLost(): boolean {
    return Math.random() < PACKET_LOSS_RATE;
  }

  getCurrentLatency(): number {
    return this.currentLatency;
  }

  /**
   * Simule l'envoi d'une opération via le réseau.
   * Applique une latence aléatoire et simule la perte de paquets.
   */
  async send<T>(data: T): Promise<NetworkResult<T>> {
    let retries = 0;

    while (retries <= MAX_RETRIES) {
      const latency = this.getRandomLatency();
      this.currentLatency = latency;
      this.onLatencyChange?.(latency);

      // Simuler la latence
      await new Promise((resolve) => setTimeout(resolve, latency));

      const lost = this.isPacketLost();
      this.onPacketSent?.(lost);

      if (!lost) {
        return {
          success: true,
          data,
          latency,
          retries,
        };
      }

      retries++;
    }

    return {
      success: false,
      latency: this.currentLatency,
      retries,
    };
  }

  /**
   * Simule un délai réduit pour les opérations locales
   */
  async sendLocal<T>(data: T): Promise<NetworkResult<T>> {
    const latency = Math.floor(this.getRandomLatency() * 0.3);
    this.currentLatency = latency;
    this.onLatencyChange?.(latency);
    
    await new Promise((resolve) => setTimeout(resolve, latency));
    
    return {
      success: true,
      data,
      latency,
      retries: 0,
    };
  }
}
