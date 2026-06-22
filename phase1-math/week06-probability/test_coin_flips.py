"""Spec for Week 6. Run: uv run pytest phase1-math/week06-probability/"""
import pytest

from coin_flips import empirical_probability, running_estimates, simulate_flips


def test_empirical_probability():
    assert empirical_probability([1, 0, 1, 1]) == 0.75
    assert empirical_probability([0, 0, 0, 0]) == 0.0
    assert empirical_probability([1, 1]) == 1.0


def test_empirical_probability_empty_raises():
    with pytest.raises(ValueError):
        empirical_probability([])


def test_simulate_flips_length_and_values():
    flips = simulate_flips(100, p_heads=0.5, seed=1)
    assert len(flips) == 100
    assert set(flips) <= {0, 1}


def test_simulate_flips_is_reproducible():
    assert simulate_flips(50, seed=7) == simulate_flips(50, seed=7)


def test_simulate_flips_validates_args():
    with pytest.raises(ValueError):
        simulate_flips(-1)
    with pytest.raises(ValueError):
        simulate_flips(10, p_heads=1.5)


def test_law_of_large_numbers():
    # With many flips, empirical probability should be close to the true p.
    flips = simulate_flips(20000, p_heads=0.3, seed=123)
    assert abs(empirical_probability(flips) - 0.3) < 0.02


def test_running_estimates():
    est = running_estimates([1, 0, 1])
    assert est[0] == 1.0
    assert est[1] == 0.5
    assert abs(est[2] - 2 / 3) < 1e-9
    assert len(running_estimates([1, 0, 1, 1, 0])) == 5
