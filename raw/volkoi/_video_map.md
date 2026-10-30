# Volkoï — mapping vidéos Gemini → WebM

Sources dans `~/Downloads` (préfixe `Animation_`) :

| Fichier (tronqué) | Anim | WebM |
|---|---|---|
| `Animation_IDLE_—_standing_at.mp4` | idle | `assets/volkoi/idle.webm` |
| `Animation_WALK_cycle_facing_r.mp4` | walk | `assets/volkoi/walk.webm` |
| `Animation_JUMP_—_crouch_→_lau.mp4` | jump | `assets/volkoi/jump.webm` |
| `Animation_RECEIVE_dig_—_arm.mp4` | receive | `assets/volkoi/receive.webm` |
| `Animation_AIM_set_—_both_op.mp4` | aim | `assets/volkoi/aim.webm` |
| `Animation_SMASH_air_attack_.mp4` | smash | `assets/volkoi/smash.webm` |
| `Animation_SUPER_move_—_dramat.mp4` | super | `assets/volkoi/super.webm` |
| `Animation_PANIC_—_both_arms_u.mp4` | panic | `assets/volkoi/panic.webm` |
| `Animation_VICTORY_—_arms_rais.mp4` | victory | `assets/volkoi/victory.webm` |
| `Animation_DEFEAT_—_shoulders.mp4` | defeat | `assets/volkoi/defeat.webm` |

Copies brutes : `raw/volkoi/volkoi_<anim>.mp4`.

Regen :
```bash
python3 tools/mp4_to_char_webm.py --batch volkoi
```
