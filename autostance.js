const stances=require('./stances');
module.exports = {
  activeClass:null,
  stance:null,
  stanceStamina:null,
  playerStamina:null,
  abnormalities:null,
  isPlayerAlive:false,
  hasAlternativeStance:false,
  dispatchStance:true,
  auto:true,
  playerName:null,

  unregister: function(messageBroker) {
    if ( stances.isExists(this.activeClass) ) {
      messageBroker.message("[autostance-info] Removed auto "+ stances[this.activeClass].desc);
      this.stance=null;
      this.stanceStamina=null;
      this.playerStamina=null;
      this.abnormalities=null;
      this.isPlayerAlive=false;
      this.dispatchStance=true;
      this.hasAlternativeStance=false;
    }
  },

  register: function(messageBroker,loginEvent) {
    this.activeClass = (loginEvent.model - 10101) % 100;
    this.cid=loginEvent.cid;
    this.playerName=loginEvent.name;
    if ( stances.isExists(this.activeClass) ) {
      this.hasAlternativeStance = stances[this.activeClass].hasAlternativeStance;
      this.stanceStamina = stances[this.activeClass].stamina;
      this.stance = this.hasAlternativeStance ? stances[this.activeClass].id[stances[this.activeClass].defaultStance] + 0x4000000 : stances[this.activeClass].id[0] + 0x4000000;
      this.abnormalities = stances[this.activeClass].abnormalities[0];
      messageBroker.message("[autostance-info] Configured auto " + stances[this.activeClass].desc + '(' + stances[this.activeClass].job + ')');
    }
  },

  abnormality: function(abnormalityType,abnormalityEvent) {
    if ( stances.isExists(this.activeClass) && abnormalityEvent.target.equals(this.cid) && this.abnormalities.indexOf(abnormalityEvent.id) > -1 && this.auto) {
      if ( abnormalityType == 'S_ABNORMALITY_BEGIN' && this.dispatchStance ) {
        this.dispatchStance=false;
      } else if ( abnormalityType == 'S_ABNORMALITY_END' && !this.dispatchStance ) {
        this.dispatchStance=true;
      }
    }
  },

  dispatch: function(dispatchEventHandler,messageBroker,locationUpdatedEvent) {
    if(stances.isExists(this.activeClass) && ( locationUpdatedEvent.type === 0 || locationUpdatedEvent.type === 1 ) && this.auto) {
      // don't dispatch stance if it requires stamina and player has insufficient stamina
      if (this.hasAlternativeStance && this.playerStamina < this.stanceStamina) return;

      // Only send the C_START_SKILL when the abnormality is off and player is alive
      if ( this.isPlayerAlive && this.dispatchStance) {
        messageBroker.message("[autostance-info] Auto dispatch -> " + stances[this.activeClass].desc[stances[this.activeClass].id.indexOf(this.stance - 0x4000000)]);
        dispatchEventHandler.toServer('C_START_SKILL',1, locationUpdatedEvent = {
            skill: this.stance,
            w: locationUpdatedEvent.w,
            x1: Math.round(locationUpdatedEvent.x1),
            y1: Math.round(locationUpdatedEvent.y1),
            z1: Math.round(locationUpdatedEvent.z1),
            unk1: 1,
            unk2:0,
            unk3:0
        });
      }
    }
  },

  hookStance: function(dispatchEventHandler,messageBroker,cStartSkillEvent) {
    if (stances.isExists(this.activeClass) && this.hasAlternativeStance && stances[this.activeClass].id.indexOf(cStartSkillEvent.skill - 0x4000000) >-1 ) {
      messageBroker.message("[autostance-info] Configure auto dispatch -> " + stances[this.activeClass].desc[stances[this.activeClass].id.indexOf(cStartSkillEvent.skill - 0x4000000)]);
      this.stance=cStartSkillEvent.skill;
      this.abnormalities=stances[this.activeClass].abnormalities[stances[this.activeClass].id.indexOf(cStartSkillEvent.skill - 0x4000000)];

      // Player triggered stance manually
      if ( this.dispatchStance ) this.dispatchStance=false;
    }
  },

  playerStatus: function(spawnEvent,statUpdatedEvent,staminaUpdatedEvent) {
    if(spawnEvent != null && spawnEvent.alive != null || spawnEvent != undefined && spawnEvent.alive != undefined ) this.isPlayerAlive=spawnEvent.alive === 1 || spawnEvent.target.equals(this.cid) && spawnEvent.alive === true;
    if(statUpdatedEvent != null && statUpdatedEvent.curRe != null || statUpdatedEvent != undefined && statUpdatedEvent.curRe != undefined ) this.playerStamina=statUpdatedEvent.curRe;
    if(staminaUpdatedEvent != null && staminaUpdatedEvent.current != null || staminaUpdatedEvent != undefined && staminaUpdatedEvent.current != undefined ) this.playerStamina=staminaUpdatedEvent.current;
  },

  /** in-game configuration by triggering "Dance" emote**/
  toggle: function(messageBroker) {
    this.auto=!this.auto;
    messageBroker.message("Autostance is ".concat(this.auto===true ? "on" : "off"))
  }
}
