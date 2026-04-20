def predict_next_15min(current_state):
    forecast = {}
    phase = current_state["phase"]
    
    # Basic multiplier model for demonstration
    multiplier = 1.0
    if phase == "Arrival":
        multiplier = 1.3
    elif phase == "Pre-match":
        multiplier = 1.1
    elif phase in ["Kickoff", "Second-half"]:
        multiplier = 0.9
    elif phase == "Halftime":
        multiplier = 1.5
    elif phase == "Final-whistle":
        multiplier = 0.2
        
    forecast["crowd_zones"] = {z: int(v * multiplier) for z, v in current_state["crowd_zones"].items()}
    
    return forecast
