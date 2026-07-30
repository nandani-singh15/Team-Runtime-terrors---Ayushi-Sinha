package com.swasuraksha.service;

import com.swasuraksha.util.HashUtil;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class BlockchainService {

    public static class Block {
        private int index;
        private long timestamp;
        private Long profileId;
        private String dataHash;
        private String previousHash;
        private String hash;

        public Block(int index, long timestamp, Long profileId, String dataHash, String previousHash) {
            this.index = index;
            this.timestamp = timestamp;
            this.profileId = profileId;
            this.dataHash = dataHash;
            this.previousHash = previousHash;
            this.hash = calculateHash();
        }

        public String calculateHash() {
            return HashUtil.sha256(index + Long.toString(timestamp) + profileId + dataHash + previousHash);
        }

        public int getIndex() { return index; }
        public long getTimestamp() { return timestamp; }
        public Long getProfileId() { return profileId; }
        public String getDataHash() { return dataHash; }
        public String getPreviousHash() { return previousHash; }
        public String getHash() { return hash; }
    }

    private final List<Block> chain = new ArrayList<>();

    public BlockchainService() {
        chain.add(new Block(0, System.currentTimeMillis(), 0L, "GENESIS_DATA", "0"));
    }

    public synchronized Block recordProfileHash(Long profileId, String dataHash) {
        String previousHash = chain.get(chain.size() - 1).getHash();
        Block newBlock = new Block(chain.size(), System.currentTimeMillis(), profileId, dataHash, previousHash);
        chain.add(newBlock);
        
        System.out.println("==================================================");
        System.out.println("BLOCKCHAIN LEDGER UPDATED (Mined block #" + newBlock.getIndex() + ")");
        System.out.println("Profile ID: " + profileId);
        System.out.println("Data Hash (SHA-256): " + dataHash);
        System.out.println("Block Hash: " + newBlock.getHash());
        System.out.println("==================================================");
        
        return newBlock;
    }

    public synchronized boolean verifyIntegrity(Long profileId, String currentHash) {
        for (int i = chain.size() - 1; i >= 0; i--) {
            Block block = chain.get(i);
            if (block.getProfileId().equals(profileId)) {
                return block.getDataHash().equals(currentHash);
            }
        }
        return false;
    }
    
    public synchronized String getLatestProfileHash(Long profileId) {
        for (int i = chain.size() - 1; i >= 0; i--) {
            Block block = chain.get(i);
            if (block.getProfileId().equals(profileId)) {
                return block.getDataHash();
            }
        }
        return "0x0000000000000000000000000000000000000000000000000000000000000000";
    }
}
