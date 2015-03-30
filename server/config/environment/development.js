'use strict';

// Development specific configuration
// ==================================
module.exports = {

  arp: {
    device: 'extras/sample_proc_net_arp',
    lanDevice: 'br0',
    arping: 'extras/simulate_arp_ping',
    pingCount: 1
  },

  mqtt: {
    topic: '/test/devices'
  }

};
