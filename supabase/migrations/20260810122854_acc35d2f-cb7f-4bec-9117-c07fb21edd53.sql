CREATE POLICY "Admins manage project photos"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'projects' AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'projects' AND has_role(auth.uid(), 'admin'::app_role));