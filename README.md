# autostance
Module to activate stance automatically when the stance buff is not activated ( teleported/resurrected/logged-in ). **It requires walk/run to activate**
- Supports override stance
- Archer & Warrior ( A-Stance as default, check the configuration section to set the D-Stance as default )
- Supports toggle
- Stance will only get activated when the required stamina ( Warrior RE ) is sufficient.

### Configure Stance
<i> In the stances.js, you can set the `defaultStance` value to change the default stance.</i>
#### Warrior
- A-Stance -> 1 (default)
- D-Stance -> 2
#### Archer ( Not configurable, has only one stance )

### Toggle
<i>Type `/proxy autostance` in chat tab to toggle autostance feature `on/off`</i>

### Override
<i> By casting a different stance in game will replace the existing/active stance and the last activated stance will be configured as the new auto stance. </i>

`A-Stance(auto)`  -> `D-Stance(cast in game)`. `D-Stance` will be activated automatically when the player is teleported or resurrected.
`A-Stance(auto)`  -> `D-Stance(cast in game)` -> `A-Stance(cast in game)`. `A-Stance` will be activated automatically when the player is teleported or resurrected.


Please submit a ticket https://github.com/tilteddev/autostance/issues for feedback/issue/additional skills. 
