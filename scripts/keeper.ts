#!/usr/bin/env node
/**
 * Sentinel Keeper Script
 * 
 * Periodically calls health_check on the Sentinel contract to keep the
 * circuit breaker state fresh. This is an external process that should be
 * run as a cron job or scheduled task.
 * 
 * Usage:
 *   KEEPER_PRIVATE_KEY=0x... KEEPER_INTERVAL_MS=300000 npx tsx scripts/keeper.ts
 * 
 * Environment variables:
 *   KEEPER_PRIVATE_KEY - Private key for the keeper account (required)
 *   KEEPER_INTERVAL_MS - Interval between health checks in ms (default: 300000 = 5 min)
 *   VITE_RPC_URL - RPC URL (default: https://rpc-bradbury.genlayer.com)
 *   VITE_CONTRACT_ADDRESS - Contract address (default: 0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000)
 *   VITE_CHAIN_ID - Chain ID (default: 4221)
 */

import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

const RPC_URL = process.env.VITE_RPC_URL ?? "https://rpc-bradbury.genlayer.com";
const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS ?? "0xD934fA3E6EB893f56dd1d53DBeD9fd6f66678000";
const CHAIN_ID = Number(process.env.VITE_CHAIN_ID ?? 4221);
const PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY;
const INTERVAL_MS = Number(process.env.KEEPER_INTERVAL_MS ?? 300000);

if (!PRIVATE_KEY) {
  console.error("ERROR: KEEPER_PRIVATE_KEY environment variable is required");
  process.exit(1);
}

if (!/^0x[a-fA-F0-9]{64}$/.test(PRIVATE_KEY)) {
  console.error("ERROR: KEEPER_PRIVATE_KEY must be a valid 64-character hex string prefixed with 0x");
  process.exit(1);
}

async function runHealthCheck(client: any): Promise<void> {
  const contract = client.contract({
    address: CONTRACT_ADDRESS,
    abi: [
      { name: "health_check", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [{ type: "bool" }] },
      { name: "get_status", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
      { name: "get_last_verdict", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
      { name: "get_incident_count", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint32" }] },
      { name: "get_last_check_timestamp", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint64" }] },
    ],
  });

  try {
    console.log(`[${new Date().toISOString()}] Submitting health_check...`);
    
    const hash = await contract.write.health_check();
    console.log(`[${new Date().toISOString()}] Transaction submitted: ${hash}`);
    
    const receipt = await client.waitForTransactionReceipt({ hash, status: "ACCEPTED" });
    console.log(`[${new Date().toISOString()}] Consensus reached (ACCEPTED): ${receipt.status}`);
    
    // Read updated state
    const [status, verdict, incidentCount, lastCheck] = await Promise.all([
      contract.read.get_status(),
      contract.read.get_last_verdict(),
      contract.read.get_incident_count(),
      contract.read.get_last_check_timestamp(),
    ]);
    
    console.log(`[${new Date().toISOString()}] State after health_check:`);
    console.log(`  Status: ${status}`);
    console.log(`  Verdict: ${verdict}`);
    console.log(`  Incident Count: ${incidentCount}`);
    console.log(`  Last Check: ${new Date(Number(lastCheck) * 1000).toISOString()}`);
    
    if (receipt.status === "FINISHED_WITH_ERROR") {
      console.error(`[${new Date().toISOString()}] Health check failed: ${receipt.executionResult?.error}`);
    }
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Health check error:`, error.message);
  }
}

async function main(): Promise<void> {
  console.log("=== Sentinel Keeper Starting ===");
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Chain ID: ${CHAIN_ID}`);
  console.log(`Interval: ${INTERVAL_MS}ms`);
  console.log("================================\n");

  const client = createClient({
    chain: testnetBradbury,
    endpoint: RPC_URL,
    account: PRIVATE_KEY as `0x${string}`,
  });

  // Initial health check
  await runHealthCheck(client);

  // Schedule periodic health checks
  const interval = setInterval(async () => {
    await runHealthCheck(client);
  }, INTERVAL_MS);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n[Shutdown] Received SIGINT, stopping keeper...");
    clearInterval(interval);
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n[Shutdown] Received SIGTERM, stopping keeper...");
    clearInterval(interval);
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});