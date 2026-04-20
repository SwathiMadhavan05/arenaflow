import random

PHASES = ["Arrival", "Pre-match", "Kickoff", "Halftime", "Second-half", "Final-whistle"]
_current_phase_index = 0

def _generate_initial_state():
    return {
        "phase": PHASES[_current_phase_index],
        "crowd_zones": {f"Zone_{i}": random.randint(10, 50) for i in range(1, 13)},
        "washrooms": {
            f"Block_{i}": {"M": random.randint(0, 10), "F": random.randint(0, 10), "Accessible": random.randint(0, 5)}
            for i in range(1, 9)
        },
        "parking": {
            "Zone_A": random.randint(10, 50),
            "Zone_B": random.randint(10, 50),
            "Zone_C": random.randint(10, 50),
            "Zone_D": random.randint(10, 50),
            "Zone_E": random.randint(10, 50),
            "EV_bays": random.randint(5, 20)
        },
        "entry_gates": {f"Gate_{i}": {"queue_depth": random.randint(5, 20), "biometric_queue_depth": random.randint(1, 10)} for i in range(1, 11)}
    }

_venue_state = _generate_initial_state()

def get_venue_state():
    return _venue_state

def advance_phase():
    global _current_phase_index, _venue_state
    if _current_phase_index < len(PHASES) - 1:
        _current_phase_index += 1
    else:
        _current_phase_index = 0
    
    phase = PHASES[_current_phase_index]
    _venue_state["phase"] = phase
    
    # Base updates
    for zone in _venue_state["crowd_zones"]:
        _venue_state["crowd_zones"][zone] = random.randint(50, 100) if phase != "Final-whistle" else random.randint(10, 50)
        
    for block in _venue_state["washrooms"]:
        for t in _venue_state["washrooms"][block]:
            _venue_state["washrooms"][block][t] = random.randint(10, 30)

    for p in _venue_state["parking"]:
        _venue_state["parking"][p] = random.randint(60, 95)
        
    for g in _venue_state["entry_gates"]:
        _venue_state["entry_gates"][g]["queue_depth"] = random.randint(2, 10)
        _venue_state["entry_gates"][g]["biometric_queue_depth"] = random.randint(1, 5)

    # Specific Triggers
    if phase == "Halftime":
        for block in _venue_state["washrooms"]:
            for t in _venue_state["washrooms"][block]:
                _venue_state["washrooms"][block][t] = int(_venue_state["washrooms"][block][t] * 1.65)
        # Using crowd zones 1-3 as concession zones proxy: +80% traffic
        for zone in ["Zone_1", "Zone_2", "Zone_3"]:
             _venue_state["crowd_zones"][zone] = int(_venue_state["crowd_zones"][zone] * 1.80)
             
    elif phase == "Final-whistle":
        # Parking exit surge 200% (value mapped as +200% -> x3.0)
        for p in _venue_state["parking"]:
             _venue_state["parking"][p] = int(_venue_state["parking"][p] * 3.0)
        # Gate egress spike
        for g in _venue_state["entry_gates"]:
             _venue_state["entry_gates"][g]["queue_depth"] = int(_venue_state["entry_gates"][g]["queue_depth"] * 4)

    return _venue_state
