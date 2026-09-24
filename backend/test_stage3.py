import unittest
import json
from datetime import datetime
import httpx
from sqlalchemy.orm import Session

from app.main import app
from app.database.session import SessionLocal
from app.models.models import (
    User, Department, Faculty, Classroom, Subject, TimetableEntry,
    DigitalTwinScenario, ScenarioComparison, PredictiveRiskAssessment,
    ChangeHistoryRecord, Notification, AuditLog
)
from app.core.security import create_access_token

class TestStage3AcademicIntelligence(unittest.IsolatedAsyncioTestCase):

    @classmethod
    def setUpClass(cls):
        cls.db: Session = SessionLocal()
        cls.admin_user = cls.db.query(User).filter(User.role == "admin").first()
        cls.student_user = cls.db.query(User).filter(User.role == "student").first()
        cls.dept = cls.db.query(Department).first()

        cls.admin_token = create_access_token(
            subject=cls.admin_user.id,
            role=cls.admin_user.role
        )
        cls.admin_headers = {"Authorization": f"Bearer {cls.admin_token}"}

        cls.student_token = create_access_token(
            subject=cls.student_user.id,
            role=cls.student_user.role
        )
        cls.student_headers = {"Authorization": f"Bearer {cls.student_token}"}

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    async def get_client(self):
        transport = httpx.ASGITransport(app=app)
        return httpx.AsyncClient(transport=transport, base_url="http://test")

    async def test_01_digital_twin_simulation_no_live_modification(self):
        """Test creating a Digital Twin simulation and verify live timetables are unchanged."""
        live_count_before = self.db.query(TimetableEntry).count()

        payload = {
            "name": "Automated Unit Test - Faculty Leave Simulation",
            "scenario_type": "Faculty Leave",
            "department_id": self.dept.id,
            "parameters": {
                "faculty_id": 1,
                "day": "Monday",
                "reason": "Sudden medical indisposition"
            }
        }
        async with await self.get_client() as client:
            res = await client.post("/api/ai/digital-twin/simulate", json=payload, headers=self.admin_headers)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("scenario_id", data)
            self.assertEqual(data["status"], "Simulated")
            self.assertGreaterEqual(data["conflicts_resolved_count"], 0)
            self.assertIn("simulated_schedule", data)
            self.assertIn("original_schedule", data)

        # Critical acceptance check: live timetable count must be identical
        live_count_after = self.db.query(TimetableEntry).count()
        self.assertEqual(live_count_before, live_count_after, "Simulation must NOT alter live timetable records!")

    async def test_02_all_8_simulation_scenarios(self):
        """Test that all 8 simulation scenarios execute without runtime error."""
        scenarios_to_test = [
            ("Faculty Leave", {"faculty_id": 1, "day": "Monday"}),
            ("Room Maintenance", {"classroom_id": 1, "maintenance_reason": "AC overhaul"}),
            ("Course Addition", {"course_code": "CS-499", "course_name": "Capstone Project", "credits": 2}),
            ("Workload Shift", {}),
            ("Placement Drive", {"event_title": "Top Tech Placement Drive", "day": "Thursday"}),
            ("Exam Displacement", {}),
            ("Emergency Modifications", {"disruption_reason": "Severe Weather", "day": "Friday"}),
            ("Capacity Change", {"capacity_scale": 65})
        ]

        async with await self.get_client() as client:
            for s_type, params in scenarios_to_test:
                payload = {
                    "name": f"Test {s_type}",
                    "scenario_type": s_type,
                    "department_id": self.dept.id,
                    "parameters": params
                }
                res = await client.post("/api/ai/digital-twin/simulate", json=payload, headers=self.admin_headers)
                self.assertEqual(res.status_code, 200, f"Scenario {s_type} failed: {res.text}")
                self.assertEqual(res.json()["scenario_type"], s_type)

    async def test_03_scenario_comparison_multi_criteria(self):
        """Test multi-scenario comparison across institutional priority weights."""
        scenarios = self.db.query(DigitalTwinScenario).limit(2).all()
        ids = [s.scenario_id for s in scenarios]

        payload = {
            "title": "Unit Test Scenario Comparison",
            "department_id": self.dept.id,
            "scenario_ids": ids,
            "priority_weights": {
                "conflicts": 10,
                "workload_balance": 8,
                "student_convenience": 9,
                "classroom_utilization": 7,
                "minimal_disruption": 8
            }
        }
        async with await self.get_client() as client:
            res = await client.post("/api/ai/digital-twin/compare", json=payload, headers=self.admin_headers)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("radar_data", data)
            self.assertIn("recommended_scenario_id", data)
            self.assertIn("tradeoff_analysis", data)
            self.assertEqual(len(data["scenarios"]), len(ids))

    async def test_04_predictive_risk_assessment(self):
        """Test predictive risk calculation from live operational database."""
        async with await self.get_client() as client:
            res = await client.get("/api/ai/predictive-risks", headers=self.admin_headers)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIsInstance(data, list)
            self.assertGreater(len(data), 0)
            for r in data:
                self.assertIn("risk_category", r)
                self.assertIn(r["risk_level"], ["Critical", "High", "Medium", "Low"])
                self.assertIn("confidence_score", r)
                self.assertIn("potential_impact", r)
                self.assertIn("suggested_preventive_action", r)

    async def test_05_advanced_analytics(self):
        """Test advanced analytics endpoint aggregates actual DB statistics."""
        async with await self.get_client() as client:
            res = await client.get("/api/ai/analytics/advanced", headers=self.admin_headers)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("faculty_workload_distribution", data)
            self.assertIn("department_utilization", data)
            self.assertIn("spatial_utilization_heatmap", data)
            self.assertIn("conflict_trends_historical", data)
            self.assertIn("institutional_kpis", data)

    async def test_06_xai_detailed_explanation(self):
        """Test explainable AI provides multi-factor reasoning."""
        async with await self.get_client() as client:
            res = await client.get("/api/ai/xai/explanation/DEC-TEST-001", headers=self.admin_headers)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("primary_justification", data)
            self.assertIn("constraints_considered", data)
            self.assertIn("conflicts_resolved", data)
            self.assertIn("rejected_alternatives", data)
            self.assertIn("stakeholder_impact", data)

    async def test_07_commit_and_rollback_workflow(self):
        """Test authorized commit of a simulation to live timetable and subsequent rollback."""
        async with await self.get_client() as client:
            # 1. Create a dedicated simulation to commit
            sim_payload = {
                "name": "Commit Workflow Test Simulation",
                "scenario_type": "Faculty Leave",
                "department_id": self.dept.id,
                "parameters": {"faculty_id": 1, "day": "Tuesday"}
            }
            sim_res = await client.post("/api/ai/digital-twin/simulate", json=sim_payload, headers=self.admin_headers)
            scenario_id = sim_res.json()["scenario_id"]

            # 2. Commit simulation to live timetable
            commit_res = await client.post(
                f"/api/ai/digital-twin/scenarios/{scenario_id}/commit",
                json={"scenario_id": scenario_id, "notes": "Authorized by test suite"},
                headers=self.admin_headers
            )
            self.assertEqual(commit_res.status_code, 200)
            change_id = commit_res.json()["change_id"]
            self.assertTrue(commit_res.json()["rollback_available"])

            # 3. Verify ChangeHistoryRecord was created
            hist_res = await client.get("/api/ai/changes/history", headers=self.admin_headers)
            self.assertEqual(hist_res.status_code, 200)
            changes = hist_res.json()
            match = next((c for c in changes if c["change_id"] == change_id), None)
            self.assertIsNotNone(match)
            self.assertFalse(match["is_rolled_back"])

            # 4. Execute 1-Click Rollback
            rb_res = await client.post(
                "/api/ai/changes/rollback",
                json={"change_id": change_id, "reason": "Test suite rollback validation"},
                headers=self.admin_headers
            )
            self.assertEqual(rb_res.status_code, 200)
            self.assertTrue(rb_res.json()["success"])

            # 5. Verify marked as rolled back
            hist_res_2 = await client.get("/api/ai/changes/history", headers=self.admin_headers)
            match_2 = next((c for c in hist_res_2.json() if c["change_id"] == change_id), None)
            self.assertTrue(match_2["is_rolled_back"])

    async def test_08_copilot_queries_and_role_restrictions(self):
        """Test Copilot handles Stage 3 queries and enforces role restrictions."""
        async with await self.get_client() as client:
            # Query 1: Admin asking for classroom utilization
            res1 = await client.post(
                "/api/ai/copilot/chat",
                json={"message": "Which department has the highest classroom utilization?"},
                headers=self.admin_headers
            )
            self.assertEqual(res1.status_code, 200)
            self.assertIn("utilization", res1.json()["reply"].lower())

            # Query 2: Student asking for confidential faculty workloads (should be restricted)
            res2 = await client.post(
                "/api/ai/copilot/chat",
                json={"message": "Which faculty members have workload imbalances?"},
                headers=self.student_headers
            )
            self.assertEqual(res2.status_code, 200)
            self.assertIn("Access Restricted", res2.json()["reply"])

            # Query 3: Multi-faculty absence simulation query
            res3 = await client.post(
                "/api/ai/copilot/chat",
                json={"message": "What happens if two faculty members are unavailable tomorrow?"},
                headers=self.admin_headers
            )
            self.assertEqual(res3.status_code, 200)
            self.assertIn("Digital Twin", res3.json()["reply"])

if __name__ == "__main__":
    unittest.main()
