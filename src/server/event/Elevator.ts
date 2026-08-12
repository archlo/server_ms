import { Event } from './Event';
import { EventType } from './EventType';
import { EventState } from './EventState';

/** Port of kinoko's Elevator - Helios Tower elevator (mod-4 cycle). */
export class Elevator extends Event {
  // Going up
  static readonly HELIOS_TOWER_2ND_FLOOR = 222020100;
  static readonly ELEVATOR_TO_LUDIBRIUM = 222020110;
  static readonly ELEVATOR_TO_LUDIBRIUM_GOING_UP = 222020111;
  // Going down
  static readonly HELIOS_TOWER_99TH_FLOOR = 222020200;
  static readonly ELEVATOR_TO_KOREAN_FOLK_TOWN = 222020210;
  static readonly ELEVATOR_TO_KOREAN_FOLK_TOWN_GOING_DOWN = 222020211;

  static readonly ELEVATOR_DOOR_REACTOR = 2208004;

  getType(): EventType { return EventType.CM_ELEVATOR; }

  /** Port of Elevator::initialize - aligns to UTC minute%4 cycle. */
  initialize(): void {
    switch (new Date().getUTCMinutes() % 4) {
      case 0: this.handleElevatorGoingDown(); break;
      case 1: this.handleElevator2ndFloor(); break;
      case 2: this.handleElevatorGoingUp(); break;
      default: this.handleElevator99thFloor(); break;
    }
    this.scheduleMinuteTick();
  }

  /** Port of Elevator::nextState. */
  nextState(): void {
    switch (this.currentState) {
      case EventState.ELEVATOR_GOING_DOWN: this.handleElevator2ndFloor(); break;
      case EventState.ELEVATOR_2ND_FLOOR: this.handleElevatorGoingUp(); break;
      case EventState.ELEVATOR_GOING_UP: this.handleElevator99thFloor(); break;
      case EventState.ELEVATOR_99TH_FLOOR: this.handleElevatorGoingDown(); break;
      default: console.error(`[Elevator] Incorrect state for Elevator : ${this.currentState}`); break;
    }
  }

  private handleElevatorGoingDown(): void {
    this.warp(Elevator.ELEVATOR_TO_KOREAN_FOLK_TOWN, Elevator.ELEVATOR_TO_KOREAN_FOLK_TOWN_GOING_DOWN, 'sp');
    this.setReactorState(Elevator.HELIOS_TOWER_2ND_FLOOR, Elevator.ELEVATOR_DOOR_REACTOR, 1);
    this.setReactorState(Elevator.HELIOS_TOWER_99TH_FLOOR, Elevator.ELEVATOR_DOOR_REACTOR, 1);
    this.currentState = EventState.ELEVATOR_GOING_DOWN;
  }

  private handleElevator2ndFloor(): void {
    this.warp(Elevator.ELEVATOR_TO_KOREAN_FOLK_TOWN_GOING_DOWN, Elevator.HELIOS_TOWER_2ND_FLOOR, 'sp');
    this.setReactorState(Elevator.HELIOS_TOWER_2ND_FLOOR, Elevator.ELEVATOR_DOOR_REACTOR, 0);
    this.setReactorState(Elevator.HELIOS_TOWER_99TH_FLOOR, Elevator.ELEVATOR_DOOR_REACTOR, 1);
    this.currentState = EventState.ELEVATOR_2ND_FLOOR;
  }

  private handleElevatorGoingUp(): void {
    this.warp(Elevator.ELEVATOR_TO_LUDIBRIUM, Elevator.ELEVATOR_TO_LUDIBRIUM_GOING_UP, 'sp');
    this.setReactorState(Elevator.HELIOS_TOWER_2ND_FLOOR, Elevator.ELEVATOR_DOOR_REACTOR, 1);
    this.setReactorState(Elevator.HELIOS_TOWER_99TH_FLOOR, Elevator.ELEVATOR_DOOR_REACTOR, 1);
    this.currentState = EventState.ELEVATOR_GOING_UP;
  }

  private handleElevator99thFloor(): void {
    this.warp(Elevator.ELEVATOR_TO_LUDIBRIUM_GOING_UP, Elevator.HELIOS_TOWER_99TH_FLOOR, 'sp');
    this.setReactorState(Elevator.HELIOS_TOWER_2ND_FLOOR, Elevator.ELEVATOR_DOOR_REACTOR, 1);
    this.setReactorState(Elevator.HELIOS_TOWER_99TH_FLOOR, Elevator.ELEVATOR_DOOR_REACTOR, 0);
    this.currentState = EventState.ELEVATOR_99TH_FLOOR;
  }
}
