
import React from "react";
import { Route } from "react-router-dom";
import { pages } from "@/config/routes";

export const DetailRoutes = () => (
  <>
    <Route path="/song/:songTitle/:artist" element={<pages.SongDetails />} />
    <Route path="/artist/:artistName" element={<pages.ArtistDetails />} />
    <Route path="/album/:albumName/:artistName" element={<pages.AlbumDetails />} />
    <Route path="*" element={<pages.NotFound />} />
  </>
);
