import sys
import json


def emit(payload: dict):
    sys.stdout.write(json.dumps(payload))
    sys.stdout.flush()


def main():
    if len(sys.argv) < 4:
        emit({"success": False, "error": "args"})
        return

    try:
        import meshtastic
        import meshtastic.serial_interface
        import meshtastic.tcp_interface
    except Exception as e:
        emit({"success": False, "error": f"import:{e}"})
        return

    mode = sys.argv[1]
    target = sys.argv[2]
    try:
        params = json.loads(sys.argv[3])
    except Exception as e:
        emit({"success": False, "error": f"json:{e}"})
        return

    dest = params.get("dest")
    hop_limit = params.get("hop_limit", 7)
    channel_index = params.get("channel_index", 0)

    try:
        if mode == "serial":
            iface = meshtastic.serial_interface.SerialInterface(devPath=target)
        elif mode == "tcp":
            host, port = target.split(":")
            iface = meshtastic.tcp_interface.TCPInterface(hostname=host, portNumber=int(port or 4403))
        else:
            emit({"success": False, "error": "mode"})
            return

        try:
            try:
                iface.sendTraceRoute(dest=dest, hopLimit=hop_limit, channelIndex=channel_index)
            except TypeError:
                iface.sendTraceRoute(dest=dest, hopLimit=hop_limit)
            emit({"success": True})
        finally:
            try:
                iface.close()
            except Exception:
                pass
    except Exception as e:
        emit({"success": False, "error": str(e)})


if __name__ == "__main__":
    main()
