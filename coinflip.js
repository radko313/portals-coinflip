/**
 * Coin Flip Game for Portals
 * Simple coin flip mini-game with Portals SDK integration
 */

class CoinFlipGame {
  constructor(options = {}) {
    this.taskPrefix = options.taskPrefix || 'coinflip';
    this.debug = options.debug || false;

    // Check if Portals SDK is loaded
    if (typeof PortalsSdk === 'undefined') {
      console.error('PortalsSdk not found! Make sure to include the Portals SDK script.');
    }

    // Initialize message listener for Portals commands
    this.initPortalsMessageListener();

    this.log('Coin Flip Game initialized');
  }

  /**
   * Send a task state update to Portals via SDK
   */
  sendTaskUpdate(taskName, taskTargetState) {
    if (typeof PortalsSdk === 'undefined') {
      this.log('PortalsSdk not available, skipping task update');
      return;
    }

    const message = {
      TaskName: taskName,
      TaskTargetState: taskTargetState
    };

    try {
      PortalsSdk.sendMessageToUnity(JSON.stringify(message));
      this.log('Sent task update:', taskName, '->', taskTargetState);
    } catch (error) {
      console.error('Failed to send task update:', error);
    }
  }

  /**
   * Send flip result to Portals
   */
  sendFlipResult(result) {
    const taskName = `${this.taskPrefix}_${result}`;
    this.sendTaskUpdate(taskName, 'SetNotActiveToCompleted');
    this.log('Flip result:', result);
  }

  /**
   * Initialize listener for messages FROM Portals
   */
  initPortalsMessageListener() {
    if (typeof PortalsSdk !== 'undefined' && PortalsSdk.setMessageListener) {
      PortalsSdk.setMessageListener((message) => {
        this.log('Received message from Portals:', message);
        this.handlePortalsMessage(message);
      });
      this.log('Portals SDK message listener registered');
    } else {
      // Fallback for testing
      window.addEventListener('message', (event) => {
        this.handlePortalsMessage(event.data);
      });
      this.log('Using fallback message listener (testing mode)');
    }
  }

  /**
   * Handle incoming messages from Portals
   */
  handlePortalsMessage(message) {
    try {
      let data = message;

      // Ignore non-Portals messages
      if (data && typeof data === 'object' && data.target) {
        return;
      }

      // Portals sends messages as strings
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
          if (data && data.action) {
            this.handleAction(data);
          }
        } catch (e) {
          // Not JSON, plain string
          this.log('Plain string value:', data);
        }
      } else if (data && typeof data === 'object' && data.action) {
        this.handleAction(data);
      }

    } catch (error) {
      console.error('[CoinFlipGame] Error handling message:', error);
    }
  }

  /**
   * Handle incoming action commands from Portals
   */
  handleAction(message) {
    const { action, ...params } = message;

    try {
      switch (action) {
        case 'resetStats':
          if (window.resetStats) {
            window.resetStats();
          }
          break;

        case 'autoFlip':
          if (window.flipCoin) {
            window.flipCoin();
          }
          break;

        default:
          this.log('Unknown action:', action);
      }
    } catch (error) {
      this.log('Error executing action:', action, error.message);
    }
  }

  /**
   * Logging helper
   */
  log(...args) {
    if (this.debug) {
      console.log('[CoinFlipGame]', ...args);
    }
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CoinFlipGame };
}
