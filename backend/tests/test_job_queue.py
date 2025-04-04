import unittest
import time
import threading
import queue
from unittest.mock import MagicMock, patch
import pytest
from sqlalchemy.orm import Session
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.job_queue import (
    task_queue, 
    start_workers, 
    stop_workers, 
    enqueue_task, 
    worker,
    process_task,
    workers_running
)
from app.models.models import Task, TaskStatus

class TestJobQueue(unittest.TestCase):
    def setUp(self):
        while not task_queue.empty():
            try:
                task_queue.get_nowait()
            except queue.Empty:
                break
    
    def tearDown(self):
        stop_workers()
    
    def test_worker_processes_tasks(self):
        mock_db = MagicMock(spec=Session)
        mock_db_factory = MagicMock()
        mock_db_factory.return_value.__next__.return_value = mock_db
        
        original_process_task = process_task
        
        try:
            process_task_mock = MagicMock()
            import app.services.job_queue
            app.services.job_queue.process_task = process_task_mock
            
            task_id = 123
            enqueue_task(task_id)
            
            global workers_running
            app.services.job_queue.workers_running = True
            thread = threading.Thread(target=worker, args=(mock_db_factory,))
            thread.daemon = True
            thread.start()
            
            task_queue.join()
            
            process_task_mock.assert_called_once()
            self.assertEqual(process_task_mock.call_args[0][0], task_id)
            
            app.services.job_queue.workers_running = False
            thread.join(timeout=1.0)
        finally:
            app.services.job_queue.process_task = original_process_task
    
    @patch('app.services.job_queue.process_task')
    def test_parallel_task_processing(self, mock_process_task):
        mock_db = MagicMock(spec=Session)
        mock_db_factory = MagicMock()
        mock_db_factory.return_value.__next__.return_value = mock_db
        
        def slow_process(*args, **kwargs):
            time.sleep(0.5)
            return None
        
        mock_process_task.side_effect = slow_process
        
        task_ids = [1, 2, 3, 4]
        for task_id in task_ids:
            enqueue_task(task_id)
        
        start_workers(mock_db_factory, num_workers=4)
        
        start_time = time.time()
        task_queue.join()
        elapsed_time = time.time() - start_time
        
        self.assertEqual(mock_process_task.call_count, len(task_ids))
        
        sequential_time = 0.5 * len(task_ids)
        self.assertLess(elapsed_time, sequential_time)
        
        processed_task_ids = [call[0][0] for call in mock_process_task.call_args_list]
        self.assertEqual(sorted(processed_task_ids), sorted(task_ids))
    
    def test_worker_handles_exceptions(self):
        mock_db = MagicMock(spec=Session)
        mock_db_factory = MagicMock()
        mock_db_factory.return_value.__next__.return_value = mock_db
        
        original_process_task = process_task
        
        try:
            process_task_mock = MagicMock(side_effect=Exception("Test exception"))
            import app.services.job_queue
            app.services.job_queue.process_task = process_task_mock
            
            task_id = 999
            enqueue_task(task_id)
            
            global workers_running
            app.services.job_queue.workers_running = True
            thread = threading.Thread(target=worker, args=(mock_db_factory,))
            thread.daemon = True
            thread.start()
            
            task_queue.join()
            
            process_task_mock.assert_called_once()
            self.assertEqual(process_task_mock.call_args[0][0], task_id)
            
            self.assertTrue(task_queue.empty())
            
            app.services.job_queue.workers_running = False
            thread.join(timeout=1.0)
        finally:
            app.services.job_queue.process_task = original_process_task
    
    def test_start_and_stop_workers(self):
        mock_db_factory = MagicMock()
        
        threads = start_workers(mock_db_factory, num_workers=3)
        
        self.assertEqual(len(threads), 3)
        for thread in threads:
            self.assertTrue(thread.is_alive())
        
        stop_workers()
        
        time.sleep(1.0)
        
        for thread in threads:
            self.assertFalse(thread.is_alive())
    
    def test_task_queue_ordering(self):
        mock_db = MagicMock(spec=Session)
        mock_db_factory = MagicMock()
        mock_db_factory.return_value.__next__.return_value = mock_db
        
        original_process_task = process_task
        
        try:
            processed_tasks = []
            
            def track_task_order(task_id, db):
                processed_tasks.append(task_id)
                time.sleep(0.1)
            
            process_task_mock = MagicMock(side_effect=track_task_order)
            import app.services.job_queue
            app.services.job_queue.process_task = process_task_mock
            
            task_ids = [101, 102, 103, 104, 105]
            for task_id in task_ids:
                enqueue_task(task_id)
            
            global workers_running
            app.services.job_queue.workers_running = True
            thread = threading.Thread(target=worker, args=(mock_db_factory,))
            thread.daemon = True
            thread.start()
            
            task_queue.join()
            
            self.assertEqual(processed_tasks, task_ids)
            
            app.services.job_queue.workers_running = False
            thread.join(timeout=1.0)
        finally:
            app.services.job_queue.process_task = original_process_task

if __name__ == '__main__':
    unittest.main()