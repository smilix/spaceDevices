'use strict';

// Development specific configuration
// ==================================
module.exports = {

  arp: {
    device: 'forTests/sample_proc_net_arp',
    lanDevice: 'br0',
    arping: 'forTests/simulate_arp_ping',
    pingCount: 1
  }

};
