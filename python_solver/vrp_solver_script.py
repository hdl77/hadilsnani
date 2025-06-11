import sys
import json
import math

def solve_vrp_with_nearest_neighbor(data):
    clients_data = data.get('clients', [])
    num_vehicles = data.get('num_vehicles', 1)
    distance_matrix = data.get('distance_matrix', [])
    duration_matrix = data.get('duration_matrix', [])

    num_locations = len(distance_matrix)
    if num_locations == 0:
        return {"optimized_routes": []}

    unvisited_clients = set(range(1, num_locations))
    optimized_routes_result = []
    depot_index = 0

    # Calculer le nombre approximatif de clients par véhicule
    # Cela est une heuristique très simple et peut ne pas être optimal
    if num_vehicles > 0:
        clients_per_vehicle = math.ceil(len(unvisited_clients) / num_vehicles)
    else:
        clients_per_vehicle = len(unvisited_clients) # Cas où num_vehicles est 0 ou négatif, assigne tout à un véhicule virtuel

    for vehicle_id in range(num_vehicles):
        if not unvisited_clients:
            break

        current_route_indices = [depot_index]
        current_location_idx = depot_index
        current_distance = 0
        current_duration = 0
        clients_served_by_this_vehicle = 0

        # Tenter d'attribuer des clients jusqu'à une limite ou qu'il n'y ait plus de clients
        while unvisited_clients and (clients_served_by_this_vehicle < clients_per_vehicle or vehicle_id == num_vehicles - 1):
            # Si c'est le dernier véhicule, il prend tous les clients restants
            
            nearest_client_idx = -1
            min_distance = math.inf

            for client_idx in unvisited_clients:
                try:
                    dist = distance_matrix[current_location_idx][client_idx]
                    if dist < min_distance:
                        min_distance = dist
                        nearest_client_idx = client_idx
                except IndexError:
                    print(f"Error: Distance matrix entry missing for {current_location_idx} to {client_idx}", file=sys.stderr)
                    continue

            if nearest_client_idx != -1:
                current_route_indices.append(nearest_client_idx)
                try:
                    current_distance += distance_matrix[current_location_idx][nearest_client_idx]
                    current_duration += duration_matrix[current_location_idx][nearest_client_idx]
                except IndexError:
                    print(f"Error: Could not retrieve distance/duration for path {current_location_idx}->{nearest_client_idx}.", file=sys.stderr)
                    pass
                
                current_location_idx = nearest_client_idx
                unvisited_clients.remove(nearest_client_idx)
                clients_served_by_this_vehicle += 1
            else:
                break # Pas de clients non visités trouvés pour cette itération

        # Retour au dépôt
        if current_route_indices[-1] != depot_index: # Si le dernier stop n'est pas déjà le dépôt
            try:
                current_distance += distance_matrix[current_location_idx][depot_index]
                current_duration += duration_matrix[current_location_idx][depot_index]
            except IndexError:
                print(f"Error: Could not retrieve distance/duration for path {current_location_idx}->{depot_index} (return to depot).", file=sys.stderr)
                pass
            current_route_indices.append(depot_index)
        
        # S'assurer qu'au moins une route a été créée (au moins Dépôt -> Dépôt)
        if len(current_route_indices) == 1:
            current_route_indices.append(depot_index) # Route devient [0, 0] si pas de client servi


        optimized_routes_result.append({
            "vehicle_id": f"v{vehicle_id + 1}",
            "stops_indices": current_route_indices,
            "distance": current_distance,
            "duration": current_duration
        })

    return {"optimized_routes": optimized_routes_result}

if __name__ == "__main__":
    try:
        input_json = sys.stdin.read()
        data = json.loads(input_json)
        result = solve_vrp_with_nearest_neighbor(data)
        sys.stdout.write(json.dumps(result))
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON input in Python script: {e}. Input was (first 200 chars): {input_json[:200]}...", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred in Python script: {e}", file=sys.stderr)
        sys.exit(1)