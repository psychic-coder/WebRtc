// PeerService class manages WebRTC peer connections, including creating offers and answers.
class PeerService {
  constructor() {
    // Check if the 'peer' instance doesn't already exist
    if (!this.peer) {
      // Initialize a new RTCPeerConnection with ICE servers (STUN servers for NAT traversal)
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              // Google STUN server for resolving external IP addresses
              "stun:stun.l.google.com:19302",
              // Twilio's global STUN server
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    }
  }

  // Method to handle an incoming offer and generate an answer
  async getAnswer(offer) {
    if (this.peer) {
      // Set the remote description with the incoming offer
      await this.peer.setRemoteDescription(offer);

      // Create an answer to the received offer
      const ans = await this.peer.createAnswer();

      // Set the local description with the created answer
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));

      // Return the generated answer
      return ans;
    }
  }

  // Method to set the remote description based on the provided answer (this is typically for the peer that received the answer)
  async setLocalDescription(ans) {
    if (this.peer) {
      // Set the remote description using the provided answer
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  // Method to generate and return an offer for initiating a connection
  async getOffer() {
    if (this.peer) {
      // Create an offer for initiating the WebRTC connection
      const offer = await this.peer.createOffer();

      // Set the local description with the created offer
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));

      // Return the generated offer
      return offer;
    }
  }
}

// Export a single instance of the PeerService class
export default new PeerService();
/*
constructor():
This method checks if the peer instance has been created. If not, it creates a new RTCPeerConnection object, which is necessary for establishing WebRTC connections. The iceServers array contains STUN servers, which help peers determine their public-facing IP addresses.

getAnswer(offer):
This asynchronous method is used to generate an answer for an incoming offer (from another peer).
The process involves setting the remote description (which represents the offer received), creating an answer to the offer, and then setting the local description (which represents the generated answer).
Finally, the answer is returned to be sent back to the peer who created the offer.

setLocalDescription(ans):
This method sets the remote description using the provided answer. This is usually called on the peer who receives the answer from the other peer after offering the connection.



getOffer():
This method is used to create and return an offer to initiate a connection. It sets the local description with the generated offer, which can then be sent to a remote peer to establish the WebRTC connection.
export default new PeerService();:

This statement exports a singleton instance of the PeerService class. This way, a single instance of the PeerService is reused throughout the application wherever it is imported.
*/
