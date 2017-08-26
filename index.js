const autostance=require('./autostance');
const Command=require('command');

module.exports = function autoStance(dispatch) {
	// Add command integration
	const command = Command(dispatch);

	/** Register player stance when login **/
	dispatch.hook('S_LOGIN', 1, autostance.register.bind(autostance));

	/** unregister player stance when player is at character selection **/
	dispatch.hook('S_RETURN_TO_LOBBY',1,autostance.unregister.bind(autostance));

	/** Action when player is teleported or resurrected**/
	dispatch.hook('S_SPAWN_ME', 1, autostance.playerStatus.bind(autostance,'spawn'));
	dispatch.hook('S_CREATURE_LIFE', 1, autostance.playerStatus.bind(autostance,'alive'));

	/** Get player current status **/
	dispatch.hook('S_PLAYER_STAT_UPDATE', 1, autostance.playerStatus.bind(autostance,'statUpdate'));
	dispatch.hook('S_PLAYER_CHANGE_STAMINA', 1, autostance.playerStatus.bind(autostance,'staminaChanged'));

	/** Actions when the player abnormalities encountered**/
	dispatch.hook('S_ABNORMALITY_BEGIN', 1, autostance.abnormality.bind(autostance,'S_ABNORMALITY_BEGIN'));
	dispatch.hook('S_ABNORMALITY_END', 1, autostance.abnormality.bind(autostance,'S_ABNORMALITY_END'))

	/** Manually change stance **/
	dispatch.hook('C_START_SKILL',1, autostance.hookStance.bind(autostance,dispatch,command));

	/** Get the current player location/coordinates and dispatch stance **/
	dispatch.hook('C_PLAYER_LOCATION', 1, autostance.dispatch.bind(autostance,dispatch,command));

	/** In-game configuration event handler**/
	command.add('autostance',autostance.toggle.bind(autostance,command));
}
