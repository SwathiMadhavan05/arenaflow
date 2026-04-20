def build_system_prompt(state):
    busiest_washroom = max(state["washrooms"].items(), key=lambda x: sum(x[1].values()))
    busiest_block = busiest_washroom[0]
    
    busiest_gate = max(state["entry_gates"].items(), key=lambda x: x[1]["queue_depth"])[0]
    
    # Calculate approx total parking filled excluding EV
    parking_lots = {k: v for k, v in state["parking"].items() if k != "EV_bays"}
    total_parking_filled = sum(parking_lots.values())
    parking_fill_percent = min(100, int((total_parking_filled / (50 * 5)) * 100)) # Approx percent
    sorted_parking = sorted(parking_lots.items(), key=lambda x: x[1], reverse=True)
    busiest_parking = ", ".join(f"{lot}: {count}" for lot, count in sorted_parking[:3])
    parking_snapshot = ", ".join(f"{lot}: {count}" for lot, count in sorted_parking)
    
    prompt = f"""You are the Venue AI Agent. Here is the LIVE venue state context:
Current Phase: {state['phase']}
Busiest Washroom: {busiest_block}
Longest Gate Queue: {busiest_gate} (Queue depth: {state["entry_gates"][busiest_gate]["queue_depth"]})
Parking Fill %: {parking_fill_percent}%
Parking Lot Snapshot: {parking_snapshot}
Busiest Parking Lots: {busiest_parking}
EV Bays Filled: {state["parking"].get("EV_bays", "unknown")}
Active Alerts: None

Use this information to assist the operations team. When asked which parking lots are heavily populated, name the busiest lots from the Parking Lot Snapshot and include their current counts.
"""
    return prompt
