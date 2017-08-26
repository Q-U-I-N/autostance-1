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

  unregister: function() {
    if ( stances.isExists(this.activeClass) ) {
      console.log("[autostance-info] Removed auto %s",stances[this.activeClass].desc);
      this.stance=null;
      this.stanceStamina=null;
      this.playerStamina=null;
      this.abnormalities=null;
      this.isPlayerAlive=false;
      this.dispatchStance=true;
      this.hasAlternativeStance=false;
    }
  },

  register: function(loginEvent) {
    this.activeClass = (loginEvent.model - 10101) % 100;
    this.cid=loginEvent.cid;
    this.playerName=loginEvent.name;
    if ( stances.isExists(this.activeClass) ) {
      this.hasAlternativeStance = stances[this.activeClass].hasAlternativeStance;
      this.stanceStamina = stances[this.activeClass].stamina;
      this.stance = this.hasAlternativeStance ? stances[this.activeClass].id[stances[this.activeClass].defaultStance-1] + 0x4000000 : stances[this.activeClass].id[0] + 0x4000000;
      this.abnormalities = stances[this.activeClass].abnormalities[0];
      console.log("[autostance-info] Configured auto " + stances[this.activeClass].desc + '(' + stances[this.activeClass].job + ')');
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

  playerStatus: function(eventType,playerStatEvent) {
	if ( stances.isExists(this.activeClass) ) {
		if ( playerStatEvent != null || playerStatEvent != undefined ) {
			if( eventType == 'spawn' || eventType == 'alive') this.isPlayerAlive=playerStatEvent.alive === 1 || playerStatEvent.target.equals(this.cid) && playerStatEvent.alive === true;
			if( eventType == 'statUpdate' && stances[this.activeClass].stamina != null ) this.playerStamina=playerStatEvent.curRe;
			if( eventType == 'staminaChanged' && stances[this.activeClass].stamina != null ) this.playerStamina=playerStatEvent.current;
		}
	}  
	
  },

  /** in-game configuration by typing "/proxy autostance" in the chat tab**/
  toggle: function(messageBroker) {
    this.auto=!this.auto;
    messageBroker.message("Autostance is ".concat(this.auto===true ? "on" : "off"))
  }
}
