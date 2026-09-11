"""Deterministic station and charger generator."""
import random
from typing import List, Tuple

from intelligence.simulation.models import Charger, Station

CONNECTORS = ["Type2", "CCS2"]
CHARGER_POWERS = [7.0, 11.0, 22.0, 50.0, 150.0]


def generate_stations(
    seed: int,
    num_stations: int,
    min_chargers: int = 2,
    max_chargers: int = 6,
) -> Tuple[List[Station], List[Charger]]:
    rnd = random.Random(seed)
    stations = []
    chargers = []
    for si in range(num_stations):
        station_id = f"S{si+1}"
        name = f"Station-{si+1}"
        lat = 51.0 + rnd.random() * 0.1
        lon = -0.1 + rnd.random() * 0.1
        num_ch = rnd.randint(min_chargers, max_chargers)
        charger_ids = []
        for ci in range(num_ch):
            cid = f"{station_id}-C{ci+1}"
            charger_ids.append(cid)
            connector = rnd.choice(CONNECTORS)
            power = rnd.choice(CHARGER_POWERS)
            chargers.append(
                Charger(
                    charger_id=cid,
                    station_id=station_id,
                    connector_type=connector,
                    max_power_kw=power,
                )
            )

        total_capacity = num_ch
        reliability = round(0.80 + rnd.random() * 0.19, 2)
        base_tariff = round(0.10 + rnd.random() * 0.25, 3)
        renewable_capability = round(rnd.random(), 2)
        stations.append(
            Station(
                station_id=station_id,
                name=name,
                latitude=lat,
                longitude=lon,
                charger_ids=charger_ids,
                total_capacity=total_capacity,
                reliability_score=reliability,
                base_tariff=base_tariff,
                renewable_capability=renewable_capability,
            )
        )

    return stations, chargers
