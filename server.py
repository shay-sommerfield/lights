from tabella import Tabella

app = Tabella()


@app.method()
def echo(a: str, b: float) -> tuple[str, float]:
    """Echo parameters back in result."""
    return a, b


if __name__ == "__main__":
    app.run()